const {
  findProductById,
  hasDeliveredPurchase,
  findReview,
  visibleReviewsForProduct,
  buildReviewSummary,
  serializeReview,
} = require("../mock-server/reviewHelpers");

const products = [{ _id: "prod007", title: "Rice" }];
const orders = [
  {
    user: { _id: "user001" },
    status: "delivered",
    items: [{ productId: { _id: "prod007" } }],
  },
  {
    user: { _id: "user001" },
    status: "pending",
    items: [{ productId: { _id: "prod001" } }],
  },
];

const reviews = [
  {
    _id: "r1",
    productId: "prod007",
    productTitle: "Rice",
    user: { _id: "user001", name: "John", email: "john@test.com" },
    rating: 5,
    body: "Great",
    verifiedPurchase: true,
    isVisible: true,
    moderationStatus: "visible",
    moderationNote: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    hiddenAt: null,
    removedAt: null,
    removedBy: null,
  },
  {
    _id: "r2",
    productId: "prod007",
    productTitle: "Rice",
    user: { _id: "user002", name: "Jane", email: "jane@test.com" },
    rating: 3,
    body: "Okay",
    verifiedPurchase: true,
    isVisible: false,
    moderationStatus: "hidden",
    moderationNote: "",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    hiddenAt: "2026-01-02T00:00:00.000Z",
    removedAt: null,
    removedBy: null,
  },
  {
    _id: "r3",
    productId: "prod007",
    productTitle: "Rice",
    user: { _id: "user003", name: "Bob", email: "bob@test.com" },
    rating: 1,
    body: "Bad",
    verifiedPurchase: true,
    isVisible: false,
    moderationStatus: "removed",
    moderationNote: "",
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    hiddenAt: null,
    removedAt: "2026-01-03T00:00:00.000Z",
    removedBy: "admin001",
  },
];

describe("reviewHelpers", () => {
  it("findProductById returns product or null", () => {
    expect(findProductById(products, "prod007")).toEqual(products[0]);
    expect(findProductById(products, "missing")).toBeNull();
  });

  it("hasDeliveredPurchase checks delivered orders only", () => {
    expect(hasDeliveredPurchase(orders, "user001", "prod007")).toBe(true);
    expect(hasDeliveredPurchase(orders, "user001", "prod001")).toBe(false);
    expect(hasDeliveredPurchase(orders, "user002", "prod007")).toBe(false);
  });

  it("findReview returns non-removed review for user/product", () => {
    expect(findReview(reviews, "user001", "prod007")?._id).toBe("r1");
    expect(findReview(reviews, "user003", "prod007")).toBeNull();
  });

  it("visibleReviewsForProduct excludes hidden and removed", () => {
    const visible = visibleReviewsForProduct(reviews, "prod007");
    expect(visible).toHaveLength(1);
    expect(visible[0]._id).toBe("r1");
  });

  it("buildReviewSummary computes average and distribution from visible only", () => {
    const summary = buildReviewSummary(reviews, "prod007");
    expect(summary.totalCount).toBe(1);
    expect(summary.averageRating).toBe(5);
    expect(summary.distribution[5]).toBe(1);
    expect(summary.distribution[1]).toBe(0);
  });

  it("serializeReview omits moderation fields for public responses", () => {
    const serialized = serializeReview(reviews[0], false);
    expect(serialized.user.email).toBeUndefined();
    expect(serialized.isVisible).toBeUndefined();
    expect(serialized.verifiedPurchase).toBe(true);
  });

  it("serializeReview includes moderation fields for admin", () => {
    const serialized = serializeReview(reviews[0], true);
    expect(serialized.user.email).toBe("john@test.com");
    expect(serialized.isVisible).toBe(true);
    expect(serialized.moderationStatus).toBe("visible");
  });
});
