const findProductById = (products, productId) =>
  products.find((p) => p._id === productId) || null;

const hasDeliveredPurchase = (orders, userId, productId) =>
  orders.some(
    (order) =>
      order.user._id === userId &&
      order.status === "delivered" &&
      order.items.some((item) => item.productId._id === productId)
  );

const findReview = (reviews, userId, productId) =>
  reviews.find(
    (review) =>
      review.user._id === userId &&
      review.productId === productId &&
      review.moderationStatus !== "removed"
  ) || null;

const visibleReviewsForProduct = (reviews, productId) =>
  reviews.filter(
    (review) =>
      review.productId === productId &&
      review.isVisible === true &&
      review.moderationStatus === "visible"
  );

const buildReviewSummary = (reviews, productId) => {
  const visible = visibleReviewsForProduct(reviews, productId);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  visible.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    totalRating += review.rating;
  });

  const totalCount = visible.length;
  const averageRating =
    totalCount > 0 ? Math.round((totalRating / totalCount) * 10) / 10 : 0;

  return { averageRating, totalCount, distribution };
};

const serializeReview = (review, includeModeration = false) => {
  const base = {
    _id: review._id,
    productId: review.productId,
    productTitle: review.productTitle,
    user: {
      _id: review.user._id,
      name: review.user.name,
      ...(includeModeration && review.user.email ? { email: review.user.email } : {}),
    },
    rating: review.rating,
    body: review.body,
    verifiedPurchase: review.verifiedPurchase,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };

  if (includeModeration) {
    return {
      ...base,
      isVisible: review.isVisible,
      moderationStatus: review.moderationStatus,
      moderationNote: review.moderationNote,
      hiddenAt: review.hiddenAt,
      removedAt: review.removedAt,
      removedBy: review.removedBy,
    };
  }

  return base;
};

module.exports = {
  findProductById,
  hasDeliveredPurchase,
  findReview,
  visibleReviewsForProduct,
  buildReviewSummary,
  serializeReview,
};
