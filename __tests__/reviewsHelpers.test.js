const { findQualifyingOrder, summarizeReviews } = require("../mock-server/reviewsHelpers");

// Fixtures mirror the shape (not the full seeded content) of mock-server/server.js's
// in-memory orders/reviews arrays, kept minimal and independent of that module so
// these tests exercise only the pure helper logic.
const orders = [
  {
    _id: "order-pending",
    user: { _id: "user001" },
    items: [{ productId: { _id: "prod001" } }],
    status: "pending",
  },
  {
    _id: "order-shipped",
    user: { _id: "user001" },
    items: [{ productId: { _id: "prod002" } }],
    status: "shipped",
  },
  {
    _id: "order-delivered",
    user: { _id: "user001" },
    items: [{ productId: { _id: "prod003" } }],
    status: "delivered",
  },
  {
    _id: "order-cancelled",
    user: { _id: "user002" },
    items: [{ productId: { _id: "prod004" } }],
    status: "cancelled",
  },
];

describe("findQualifyingOrder", () => {
  it("returns the order when a pending purchase exists for the user/product pair", () => {
    expect(findQualifyingOrder(orders, "user001", "prod001")).toBe(orders[0]);
  });

  it("returns the order when a shipped purchase exists for the user/product pair", () => {
    expect(findQualifyingOrder(orders, "user001", "prod002")).toBe(orders[1]);
  });

  it("returns the order when a delivered purchase exists for the user/product pair", () => {
    expect(findQualifyingOrder(orders, "user001", "prod003")).toBe(orders[2]);
  });

  it("does not count a cancelled order as a qualifying purchase", () => {
    expect(findQualifyingOrder(orders, "user002", "prod004")).toBeUndefined();
  });

  it("returns undefined when the user never purchased the product", () => {
    expect(findQualifyingOrder(orders, "user002", "prod001")).toBeUndefined();
  });
});

describe("summarizeReviews", () => {
  const reviews = [
    { productId: "prod001", rating: 5, status: "visible" },
    { productId: "prod001", rating: 3, status: "visible" },
    { productId: "prod001", rating: 5, status: "hidden" },
    { productId: "prod002", rating: 1, status: "visible" },
  ];

  it("averages only visible reviews for the given product", () => {
    expect(summarizeReviews(reviews, "prod001")).toEqual({
      average: 4,
      count: 2,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 },
    });
  });

  it("rounds the average to one decimal place", () => {
    const threeReviews = [
      { productId: "prod005", rating: 5, status: "visible" },
      { productId: "prod005", rating: 4, status: "visible" },
      { productId: "prod005", rating: 4, status: "visible" },
    ];
    expect(summarizeReviews(threeReviews, "prod005").average).toBeCloseTo(4.3, 1);
  });

  it("returns a zeroed summary when there are no visible reviews for the product", () => {
    expect(summarizeReviews(reviews, "prod999")).toEqual({
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });
});
