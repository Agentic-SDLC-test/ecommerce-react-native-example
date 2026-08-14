const {
  startServer,
  __reviewTestUtils,
} = require("../mock-server/server");

describe("Review helpers", () => {
  beforeEach(() => {
    __reviewTestUtils.resetReviewStore();
    __reviewTestUtils.resetWishlistStore();
  });

  it("derives summary data from visible reviews only", () => {
    const summary = __reviewTestUtils.buildReviewSummary("prod001");

    expect(summary).toEqual({
      averageRating: 5,
      totalVisibleReviews: 1,
      ratingDistribution: {
        5: 1,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    });
  });

  it("derives eligibility and current review state for delivered purchasers", () => {
    const bundle = __reviewTestUtils.buildProductReviewBundle(
      "prod001",
      __reviewTestUtils.getUserById("user001")
    );

    expect(bundle.eligibility).toEqual({
      canReview: true,
      reason: null,
      qualifyingOrderId: "ORD-2024-004",
    });
    expect(bundle.currentUserReview).toMatchObject({
      _id: "rev001",
      rating: 5,
      visibility: "visible",
    });
    expect(bundle.recentReviews).toHaveLength(1);
  });
});

describe("Review routes", () => {
  let server;
  let baseUrl;

  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { status: response.status, body };
  };

  beforeEach(async () => {
    __reviewTestUtils.resetReviewStore();
    await new Promise((resolve) => {
      server = startServer(0, { silent: true });
      server.on("listening", resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach((done) => {
    server.close(done);
  });

  it("creates then updates one review per shopper and product", async () => {
    const createResponse = await request("/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod007",
        rating: 4,
        comment: "Really good pantry staple for weeknight meals.",
      }),
    });

    const updateResponse = await request("/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        productId: "prod007",
        rating: 5,
        comment: "Still excellent after a second order and easy to cook.",
      }),
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.review.visibility).toBe("visible");
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.review.rating).toBe(5);

    const bundleResponse = await request(
      "/product-reviews?productId=prod007"
    );

    expect(bundleResponse.body.data.summary.totalVisibleReviews).toBe(1);
    expect(bundleResponse.body.data.recentReviews[0].rating).toBe(5);
  });

  it("rejects shoppers without a delivered qualifying order", async () => {
    const response = await request("/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-002",
      },
      body: JSON.stringify({
        productId: "prod001",
        rating: 4,
        comment: "This should fail because the user never bought it.",
      }),
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Only verified purchasers can review this product"
    );
  });

  it("hides, restores, and removes reviews through admin moderation", async () => {
    const hideResponse = await request(
      "/admin/review-visibility?id=rev001&visibility=hidden",
      {
        headers: {
          "x-auth-token": "mock-admin-token-001",
        },
      }
    );

    const hiddenBundle = await request("/product-reviews?productId=prod001");

    const showResponse = await request(
      "/admin/review-visibility?id=rev001&visibility=visible",
      {
        headers: {
          "x-auth-token": "mock-admin-token-001",
        },
      }
    );

    const removeResponse = await request("/admin/delete-review?id=rev001", {
      headers: {
        "x-auth-token": "mock-admin-token-001",
      },
    });

    const removedBundle = await request("/product-reviews?productId=prod001");

    expect(hideResponse.status).toBe(200);
    expect(hideResponse.body.data.visibility).toBe("hidden");
    expect(hiddenBundle.body.data.summary.totalVisibleReviews).toBe(0);
    expect(showResponse.status).toBe(200);
    expect(showResponse.body.data.visibility).toBe("visible");
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.data.visibility).toBe("removed");
    expect(removedBundle.body.data.summary.totalVisibleReviews).toBe(0);
  });
});
