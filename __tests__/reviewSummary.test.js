/* global describe, it, expect */
const {
  assertReviewEligibility,
  buildProductReviewSummary,
  serializeReview,
} = require("../mock-server/reviewSummary");

describe("review summary helpers", () => {
  const baseReviews = [
    {
      _id: "review-1",
      productId: "prod007",
      orderId: "order003",
      rating: 5,
      comment: "Excellent pantry staple",
      verifiedPurchase: true,
      moderationStatus: "visible",
      createdAt: "2024-01-12T10:00:00.000Z",
      updatedAt: "2024-01-14T10:00:00.000Z",
      user: {
        _id: "user001",
        name: "John Doe",
        email: "user@easybuy.com",
      },
    },
    {
      _id: "review-2",
      productId: "prod007",
      orderId: "order099",
      rating: 2,
      comment: "Hidden review",
      verifiedPurchase: true,
      moderationStatus: "hidden",
      createdAt: "2024-01-12T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
      user: {
        _id: "user002",
        name: "Jane Smith",
        email: "jane@easybuy.com",
      },
    },
  ];

  it("serializes public review data without shopper email", () => {
    expect(serializeReview(baseReviews[0])).toMatchObject({
      _id: "review-1",
      rating: 5,
      moderationStatus: "visible",
      user: {
        _id: "user001",
        name: "John Doe",
      },
    });
    expect(serializeReview(baseReviews[0]).user.email).toBeUndefined();
  });

  it("builds visible-only product summaries", () => {
    expect(buildProductReviewSummary(baseReviews, "prod007")).toEqual({
      averageRating: 5,
      totalReviewCount: 1,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 1,
      },
      recentReviews: [
        expect.objectContaining({
          _id: "review-1",
          comment: "Excellent pantry staple",
          verifiedPurchase: true,
        }),
      ],
    });
  });

  it("requires a delivered order before review create or edit", () => {
    expect(() =>
      assertReviewEligibility({
        user: { _id: "user001" },
        productId: "prod007",
        orders: [
          {
            user: { _id: "user001" },
            status: "pending",
            items: [{ productId: { _id: "prod007" } }],
          },
        ],
      })
    ).toThrow("Only verified purchasers can review this product");
  });

  it("rejects edits by non-owners", () => {
    expect(() =>
      assertReviewEligibility({
        user: { _id: "user002" },
        productId: "prod007",
        orders: [
          {
            user: { _id: "user002" },
            status: "delivered",
            items: [{ productId: { _id: "prod007" } }],
          },
        ],
        existingReview: baseReviews[0],
      })
    ).toThrow("You can only edit your own review");
  });
});
