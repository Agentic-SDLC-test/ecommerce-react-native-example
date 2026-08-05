/* global describe, it, expect, beforeEach, afterEach */
const { createApp, createInitialState } = require("../mock-server/server");

describe("review routes", () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    const { app } = createApp(createInitialState());
    server = await new Promise((resolve) => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach(async () => {
    if (!server) {
      return;
    }

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  it("blocks review creation when the product has not been delivered", async () => {
    const response = await fetch(`${baseUrl}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-002",
      },
      body: JSON.stringify({
        productId: "prod005",
        rating: 4,
        comment: "Waiting for delivery",
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(403);
    expect(result.message).toBe(
      "Only verified purchasers can review this product"
    );
  });

  it("creates one visible review per shopper and product", async () => {
    const createResponse = await fetch(`${baseUrl}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod007",
        rating: 5,
        comment: "A dependable everyday staple",
      }),
    });
    const createResult = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(createResult.message).toBe("Review saved successfully");
    expect(createResult.data.summary).toMatchObject({
      averageRating: 5,
      totalReviewCount: 1,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 1,
      },
    });

    const duplicateResponse = await fetch(`${baseUrl}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod007",
        rating: 4,
        comment: "Trying again",
      }),
    });
    const duplicateResult = await duplicateResponse.json();

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResult.message).toBe(
      "You have already reviewed this product"
    );
  });

  it("hides moderated reviews from shopper-facing aggregates", async () => {
    const createResponse = await fetch(`${baseUrl}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod007",
        rating: 4,
        comment: "Tasty and reliable",
      }),
    });
    const createResult = await createResponse.json();
    const reviewId = createResult.data.review._id;

    const moderateResponse = await fetch(
      `${baseUrl}/admin/review-visibility?id=${reviewId}&status=hidden`,
      {
        headers: {
          "x-auth-token": "mock-admin-token-001",
        },
      }
    );
    const moderateResult = await moderateResponse.json();
    expect(moderateResponse.status).toBe(200);
    expect(moderateResult.data.moderationStatus).toBe("hidden");

    const summaryResponse = await fetch(
      `${baseUrl}/product-reviews?productId=prod007`,
      {
        headers: {
          "x-auth-token": "mock-user-token-001",
        },
      }
    );
    const summaryResult = await summaryResponse.json();

    expect(summaryResponse.status).toBe(200);
    expect(summaryResult.data.summary.totalReviewCount).toBe(0);
    expect(summaryResult.data.viewer).toMatchObject({
      canSubmit: false,
      hasExistingReview: true,
      reviewId,
      reason: "already_reviewed",
    });
  });
});
