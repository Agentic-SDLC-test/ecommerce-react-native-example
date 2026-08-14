// Pure helper functions for the reviews feature, kept dependency-free from
// Express so they can be required directly from Jest tests under __tests__/
// without booting the mock server (mock-server/ has no app.listen guard and
// is excluded from Jest's testPathIgnorePatterns for test *discovery* only —
// requiring this module directly does not trigger that exclusion).

// Order statuses that count as a qualifying purchase for review eligibility.
const QUALIFYING_ORDER_STATUSES = ["pending", "shipped", "delivered"];

// Returns the first order that makes `userId` a verified purchaser of
// `productId`, or undefined if no qualifying order exists.
const findQualifyingOrder = (orders, userId, productId) =>
  orders.find(
    (order) =>
      order.user._id === userId &&
      QUALIFYING_ORDER_STATUSES.includes(order.status) &&
      order.items.some((item) => item.productId._id === productId)
  );

// Computes the average rating, total visible review count, and rating
// distribution (1-5 stars) for a product from the full `reviews` array.
const summarizeReviews = (reviews, productId) => {
  const visibleReviews = reviews.filter(
    (review) => review.productId === productId && review.status === "visible"
  );
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (visibleReviews.length === 0) {
    return { average: 0, count: 0, distribution };
  }
  let total = 0;
  visibleReviews.forEach((review) => {
    total += review.rating;
    distribution[review.rating] += 1;
  });
  const average = Math.round((total / visibleReviews.length) * 10) / 10;
  return { average, count: visibleReviews.length, distribution };
};

module.exports = { QUALIFYING_ORDER_STATUSES, findQualifyingOrder, summarizeReviews };
