const {
  buildReviewSummary,
  findEligibleDeliveredOrder,
  resetMockData,
  startServer,
} = require("../mock-server/server");

describe("mock-server reviews", () => {
  let server;
  let baseUrl;

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { status: response.status, body };
  }

  beforeAll(async () => {
    server = startServer({ port: 0, host: "127.0.0.1", silent: true });
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  });

  beforeEach(() => {
    resetMockData();
  });

  it("finds the latest delivered order and computes published aggregates", () => {
    expect(findEligibleDeliveredOrder("user001", "prod003")).toEqual({
      _id: "order004",
      orderId: "ORD-2024-004",
    });

    const summary = buildReviewSummary("prod001");
    expect(summary.averageRating).toBe(4.5);
    expect(summary.totalReviewCount).toBe(2);
    expect(summary.ratingDistribution[4]).toBe(1);
    expect(summary.ratingDistribution[5]).toBe(1);
    expect(summary.recentReviews[0]._id).toBe("review002");
  });

  it("returns anonymous and authenticated viewer states on product review reads", async () => {
    const anonymous = await request("/product-reviews?productId=prod003");
    expect(anonymous.status).toBe(200);
    expect(anonymous.body.data.viewer.reason).toBe("LOGIN_REQUIRED");
    expect(anonymous.body.data.summary.totalReviewCount).toBe(0);

    const authenticated = await request("/product-reviews?productId=prod003", {
      headers: { "x-auth-token": "mock-user-token-001" },
    });
    expect(authenticated.status).toBe(200);
    expect(authenticated.body.data.viewer.canReview).toBe(true);
    expect(authenticated.body.data.viewer.eligibleOrderId).toBe("order004");
  });

  it("creates reviews only for delivered purchases and prevents duplicates", async () => {
    const forbidden = await request("/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod003",
        orderId: "order001",
        rating: 5,
        comment: "These headphones sound fantastic and feel very premium.",
      }),
    });
    expect(forbidden.status).toBe(403);

    const created = await request("/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod003",
        orderId: "order004",
        rating: 5,
        comment: "These headphones sound fantastic and feel very premium.",
      }),
    });
    expect(created.status).toBe(200);
    expect(created.body.data.status).toBe("published");

    const duplicate = await request("/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod001",
        orderId: "order004",
        rating: 4,
        comment: "Still a great shirt after a second order and a few washes.",
      }),
    });
    expect(duplicate.status).toBe(409);
  });

  it("updates reviews, preserves hidden status, and locks removed reviews", async () => {
    const updated = await request("/update-review?id=review003", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        rating: 4,
        comment: "Updated hidden review text that still stays hidden to shoppers.",
      }),
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("hidden");
    expect(updated.body.data.rating).toBe(4);

    const removed = await request("/update-review?id=review004", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-002",
      },
      body: JSON.stringify({
        rating: 2,
        comment: "Trying to change a removed review should still be blocked.",
      }),
    });
    expect(removed.status).toBe(409);
  });

  it("supports admin moderation and dashboard review counts", async () => {
    const unauthorized = await request("/admin/reviews", {
      headers: { "x-auth-token": "mock-user-token-001" },
    });
    expect(unauthorized.status).toBe(403);

    const reviews = await request("/admin/reviews", {
      headers: { "x-auth-token": "mock-admin-token-001" },
    });
    expect(reviews.status).toBe(200);
    expect(reviews.body.data[0]).toEqual(
      expect.objectContaining({
        productTitle: expect.any(String),
        userName: expect.any(String),
      })
    );

    const moderated = await request(
      "/admin/review-status?id=review001&status=hidden",
      {
        headers: { "x-auth-token": "mock-admin-token-001" },
      }
    );
    expect(moderated.status).toBe(200);
    expect(moderated.body.data.status).toBe("hidden");
    expect(moderated.body.data.moderatedBy).toBe("admin001");

    const dashboard = await request("/dashboard", {
      headers: { "x-auth-token": "mock-admin-token-001" },
    });
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.reviewsCount).toBe(4);
  });

  it("serves wishlist data for existing product detail flows on the mock server", async () => {
    const wishlist = await request("/wishlist", {
      headers: { "x-auth-token": "mock-user-token-001" },
    });
    expect(wishlist.status).toBe(200);
    expect(wishlist.body.data[0].wishlist[0].productId._id).toBe("prod003");
  });
});
