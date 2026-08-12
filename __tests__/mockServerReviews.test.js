const serverReviews = require("../mock-server/reviews");
const appReviews = require("../constants/Reviews");
const appRules = require("../utils/reviews");

// /mock-server/ is excluded from jest test *discovery*, but its modules are
// importable — which is what lets the server invariants get real coverage.

const order = (userId, productId, status) => ({
  _id: `order-${userId}-${productId}`,
  user: { _id: userId, name: "John Doe" },
  items: [{ productId: { _id: productId, title: "A product" }, price: 1, quantity: 1 }],
  status,
});

describe("app and mock-server review vocabulary", () => {
  it("keeps REVIEW_VISIBILITIES identical on both sides", () => {
    expect({ ...serverReviews.REVIEW_VISIBILITIES }).toEqual({
      ...appReviews.REVIEW_VISIBILITIES,
    });
  });

  it("keeps REVIEW_ELIGIBILITY identical on both sides", () => {
    expect({ ...serverReviews.REVIEW_ELIGIBILITY }).toEqual({
      ...appReviews.REVIEW_ELIGIBILITY,
    });
  });

  it("keeps the rating and text limits identical on both sides", () => {
    expect(serverReviews.RATING_MIN).toBe(appReviews.RATING_MIN);
    expect(serverReviews.RATING_MAX).toBe(appReviews.RATING_MAX);
    expect(serverReviews.REVIEW_TEXT_MAX_LENGTH).toBe(
      appReviews.REVIEW_TEXT_MAX_LENGTH
    );
  });
});

describe("withReviewDefaults", () => {
  const createdAt = "2024-01-20T09:00:00.000Z";

  it("fills the moderation and text fields in", () => {
    const result = serverReviews.withReviewDefaults({
      _id: "rev001",
      createdAt,
      rating: 5,
      verified_purchase: true,
      visibility: "visible",
    });

    expect(result.text).toBe("");
    expect(result.moderated_by).toBeNull();
    expect(result.moderated_at).toBeNull();
    expect(result.moderation_action).toBeNull();
    expect(result.updatedAt).toBe(createdAt);
  });

  it("defaults an unknown visibility to visible", () => {
    expect(serverReviews.withReviewDefaults({ createdAt }).visibility).toBe(
      "visible"
    );
    expect(
      serverReviews.withReviewDefaults({ createdAt, visibility: "weird" })
        .visibility
    ).toBe("visible");
  });

  it("preserves an explicitly hidden row", () => {
    expect(
      serverReviews.withReviewDefaults({ createdAt, visibility: "hidden" })
        .visibility
    ).toBe("hidden");
  });

  it("coerces verified_purchase to a strict boolean", () => {
    expect(
      serverReviews.withReviewDefaults({ createdAt, verified_purchase: "yes" })
        .verified_purchase
    ).toBe(false);
    expect(
      serverReviews.withReviewDefaults({ createdAt, verified_purchase: true })
        .verified_purchase
    ).toBe(true);
  });

  it("returns a copy and leaves the stored row alone", () => {
    const review = { createdAt };
    const result = serverReviews.withReviewDefaults(review);

    expect(result).not.toBe(review);
    expect(review.visibility).toBeUndefined();
    expect(review.moderated_by).toBeUndefined();
  });
});

describe("validateReviewSubmission", () => {
  it("accepts a rating with empty text", () => {
    expect(serverReviews.validateReviewSubmission({ rating: 3 })).toEqual({
      valid: true,
      message: "",
    });
    expect(
      serverReviews.validateReviewSubmission({ rating: 3, text: "" })
    ).toEqual({ valid: true, message: "" });
  });

  it("rejects a rating outside 1 to 5", () => {
    [0, 6, -2].forEach((rating) => {
      const result = serverReviews.validateReviewSubmission({ rating });
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Rating must be a whole number from 1 to 5");
    });
  });

  it("rejects a rating that is not a whole number", () => {
    expect(serverReviews.validateReviewSubmission({ rating: 4.5 }).valid).toBe(
      false
    );
    expect(serverReviews.validateReviewSubmission({ rating: "4" }).valid).toBe(
      false
    );
  });

  it("rejects text over the limit and accepts text at it", () => {
    const tooLong = serverReviews.validateReviewSubmission({
      rating: 4,
      text: "a".repeat(501),
    });

    expect(tooLong.valid).toBe(false);
    expect(tooLong.message).toBe("Review text must be 500 characters or fewer");
    expect(
      serverReviews.validateReviewSubmission({ rating: 4, text: "a".repeat(500) })
        .valid
    ).toBe(true);
  });
});

describe("resolveEligibility", () => {
  it("refuses a shopper with no orders at all", () => {
    expect(
      serverReviews.resolveEligibility({
        orders: [],
        userId: "user001",
        productId: "prod001",
      })
    ).toBe("no_purchase");
  });

  it("refuses a shopper whose delivered order does not contain the product", () => {
    expect(
      serverReviews.resolveEligibility({
        orders: [order("user001", "prod007", "delivered")],
        userId: "user001",
        productId: "prod001",
      })
    ).toBe("no_purchase");
  });

  it("refuses another shopper's delivered order", () => {
    expect(
      serverReviews.resolveEligibility({
        orders: [order("user002", "prod001", "delivered")],
        userId: "user001",
        productId: "prod001",
      })
    ).toBe("no_purchase");
  });

  it("makes a shopper wait while the order is pending or shipped", () => {
    ["pending", "shipped"].forEach((status) => {
      expect(
        serverReviews.resolveEligibility({
          orders: [order("user001", "prod001", status)],
          userId: "user001",
          productId: "prod001",
        })
      ).toBe("not_delivered");
    });
  });

  it("admits a shopper once the order has been delivered", () => {
    expect(
      serverReviews.resolveEligibility({
        orders: [
          order("user001", "prod001", "pending"),
          order("user001", "prod001", "delivered"),
        ],
        userId: "user001",
        productId: "prod001",
      })
    ).toBe("eligible");
  });
});

describe("summarizeReviews", () => {
  const rows = [
    { rating: 5, visibility: "visible" },
    { rating: 3, visibility: "visible" },
    { rating: 1, visibility: "hidden" },
  ];

  it("excludes hidden rows", () => {
    const summary = serverReviews.summarizeReviews(rows);

    expect(summary.count).toBe(2);
    expect(summary.average).toBe(4);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 });
  });

  it("returns a null average for no visible rows, never 0", () => {
    [[], [{ rating: 5, visibility: "hidden" }]].forEach((input) => {
      const summary = serverReviews.summarizeReviews(input);
      expect(summary.count).toBe(0);
      expect(summary.average).toBeNull();
      expect(summary.average).not.toBe(0);
    });
  });

  it("matches the client copy on the same input", () => {
    [rows, [], [{ rating: 4, visibility: "visible" }]].forEach((input) => {
      expect(serverReviews.summarizeReviews(input)).toEqual(
        appRules.summarizeReviews(input)
      );
    });
  });
});

describe("publicReview", () => {
  const stored = {
    _id: "rev001",
    productId: "prod001",
    user: { _id: "user001", name: "John Doe" },
    reviewer_name: "John Doe",
    rating: 5,
    text: "Fits well.",
    verified_purchase: true,
    visibility: "visible",
    moderated_by: "admin001",
    moderated_at: "2024-02-01T12:00:00.000Z",
    moderation_action: "restore",
    createdAt: "2024-01-20T09:00:00.000Z",
    updatedAt: "2024-01-20T09:00:00.000Z",
  };

  it("returns exactly the nine shopper-facing keys", () => {
    expect(Object.keys(serverReviews.publicReview(stored)).sort()).toEqual(
      [
        "_id",
        "productId",
        "reviewer_name",
        "rating",
        "text",
        "verified_purchase",
        "visibility",
        "createdAt",
        "updatedAt",
      ].sort()
    );
  });

  it("leaks no user object, email, order reference or moderation metadata", () => {
    const projection = serverReviews.publicReview(stored);

    Object.keys(projection).forEach((key) => {
      expect(key).not.toMatch(/email|user_id|moderat/i);
    });
    expect(projection.user).toBeUndefined();
    expect(JSON.stringify(projection)).not.toMatch(/admin001/);
  });
});

describe("adminReview", () => {
  const stored = {
    _id: "rev002",
    productId: "prod003",
    user: { _id: "user002", name: "Jane Smith" },
    reviewer_name: "Jane Smith",
    rating: 2,
    text: "Battery life was worse than advertised.",
    verified_purchase: true,
    visibility: "hidden",
    moderated_by: "admin001",
    moderated_at: "2024-02-01T12:00:00.000Z",
    moderation_action: "hide",
    createdAt: "2024-01-25T08:00:00.000Z",
    updatedAt: "2024-01-25T08:00:00.000Z",
  };

  it("adds exactly the moderation fields on top of the public projection", () => {
    const publicKeys = Object.keys(serverReviews.publicReview(stored));
    const adminKeys = Object.keys(serverReviews.adminReview(stored));

    expect(adminKeys.filter((key) => !publicKeys.includes(key)).sort()).toEqual(
      ["moderated_at", "moderated_by", "moderation_action", "user"].sort()
    );
  });

  it("carries the acting admin and the reviewer identity, but still no email", () => {
    const projection = serverReviews.adminReview(stored);

    expect(projection.moderated_by).toBe("admin001");
    expect(projection.moderation_action).toBe("hide");
    expect(projection.user).toEqual({ _id: "user002", name: "Jane Smith" });
    expect(JSON.stringify(projection)).not.toMatch(/@/);
  });
});

describe("isReviewsEnabled", () => {
  it("is on when the server flag is unset", () => {
    expect(serverReviews.isReviewsEnabled({})).toBe(true);
    expect(serverReviews.isReviewsEnabled()).toBe(true);
    expect(serverReviews.isReviewsEnabled({ REVIEWS_ENABLED: "true" })).toBe(
      true
    );
  });

  it('is off only when the server flag is exactly "false"', () => {
    expect(serverReviews.isReviewsEnabled({ REVIEWS_ENABLED: "false" })).toBe(
      false
    );
    expect(serverReviews.isReviewsEnabled({ REVIEWS_ENABLED: "0" })).toBe(true);
  });
});
