const {
  hasVerifiedPurchase,
  findReview,
  validateReviewPayload,
  buildReviewSummary,
  serializeReview,
} = require("../mock-server/reviewHelpers");

const sampleOrders = [
  {
    _id: "order001",
    user: { _id: "user001" },
    status: "pending",
    items: [{ productId: { _id: "prod007" } }],
  },
  {
    _id: "order002",
    user: { _id: "user001" },
    status: "delivered",
    items: [{ productId: { _id: "prod007" } }],
  },
  {
    _id: "order003",
    user: { _id: "user002" },
    status: "shipped",
    items: [{ productId: { _id: "prod007" } }],
  },
];

const sampleReviews = [
  {
    _id: "r1",
    productId: "prod007",
    productTitle: "Rice",
    user: { _id: "user001", name: "John", email: "john@test.com" },
    rating: 5,
    reviewText: "Great",
    verifiedPurchase: true,
    visible: true,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
  {
    _id: "r2",
    productId: "prod007",
    productTitle: "Rice",
    user: { _id: "user002", name: "Jane", email: "jane@test.com" },
    rating: 3,
    reviewText: "Okay",
    verifiedPurchase: true,
    visible: true,
    createdAt: "2024-01-04T00:00:00.000Z",
    updatedAt: "2024-01-04T00:00:00.000Z",
  },
  {
    _id: "r3",
    productId: "prod007",
    productTitle: "Rice",
    user: { _id: "user003", name: "Hidden", email: "hidden@test.com" },
    rating: 1,
    reviewText: "Hidden",
    verifiedPurchase: true,
    visible: false,
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-05T00:00:00.000Z",
  },
];

describe("reviewHelpers", () => {
  describe("hasVerifiedPurchase", () => {
    it("allows delivered orders containing the product", () => {
      expect(hasVerifiedPurchase("user001", "prod007", sampleOrders)).toBe(true);
    });

    it("denies pending or shipped orders", () => {
      expect(hasVerifiedPurchase("user002", "prod007", sampleOrders)).toBe(false);
    });

    it("denies other users orders", () => {
      expect(hasVerifiedPurchase("user003", "prod007", sampleOrders)).toBe(false);
    });
  });

  describe("validateReviewPayload", () => {
    it("accepts valid rating and text", () => {
      const result = validateReviewPayload({ rating: 4, reviewText: " Nice " });
      expect(result.valid).toBe(true);
      expect(result.rating).toBe(4);
      expect(result.reviewText).toBe("Nice");
    });

    it("rejects invalid rating", () => {
      expect(validateReviewPayload({ rating: 0, reviewText: "x" }).valid).toBe(false);
    });

    it("rejects empty or too long text", () => {
      expect(validateReviewPayload({ rating: 3, reviewText: "   " }).valid).toBe(false);
      expect(
        validateReviewPayload({ rating: 3, reviewText: "a".repeat(501) }).valid
      ).toBe(false);
    });
  });

  describe("buildReviewSummary", () => {
    it("computes average, distribution, and excludes hidden reviews", () => {
      const summary = buildReviewSummary("prod007", sampleReviews);
      expect(summary.totalCount).toBe(2);
      expect(summary.averageRating).toBe(4);
      expect(summary.distribution[5]).toBe(1);
      expect(summary.distribution[3]).toBe(1);
      expect(summary.recentReviews).toHaveLength(2);
    });

    it("handles zero reviews without divide-by-zero", () => {
      const summary = buildReviewSummary("prod999", sampleReviews);
      expect(summary.totalCount).toBe(0);
      expect(summary.averageRating).toBe(0);
      expect(summary.recentReviews).toEqual([]);
    });
  });

  describe("findReview", () => {
    it("finds review by product and user", () => {
      const review = findReview("prod007", "user001", sampleReviews);
      expect(review._id).toBe("r1");
    });
  });

  describe("serializeReview", () => {
    it("omits email in public DTO", () => {
      const dto = serializeReview(sampleReviews[0]);
      expect(dto.userName).toBe("John");
      expect(dto.userEmail).toBeUndefined();
      expect(dto.verifiedPurchase).toBe(true);
    });

    it("includes email for admin DTO", () => {
      const dto = serializeReview(
        { ...sampleReviews[0], hiddenAt: null, hiddenBy: null },
        true
      );
      expect(dto.userEmail).toBe("john@test.com");
    });
  });
});
