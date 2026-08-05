const RATING_VALUES = [1, 2, 3, 4, 5];

function createReviewError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function serializeReview(review, options = {}) {
  const includeProduct = options.includeProduct === true;
  const includeUserEmail = options.includeUserEmail === true;

  return {
    _id: review._id,
    productId: review.productId,
    orderId: review.orderId,
    rating: review.rating,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase === true,
    moderationStatus: review.moderationStatus,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    hiddenAt: review.hiddenAt || null,
    removedAt: review.removedAt || null,
    user: {
      _id: review.user?._id,
      name: review.user?.name,
      ...(includeUserEmail ? { email: review.user?.email } : {}),
    },
    ...(includeProduct
      ? {
          product: review.product || null,
        }
      : {}),
  };
}

function buildProductReviewSummary(reviews, productId, options = {}) {
  const recentLimit = options.recentLimit || 5;
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const visibleReviews = reviews
    .filter(
      (review) =>
        review.productId === productId && review.moderationStatus === "visible"
    )
    .sort((firstReview, secondReview) => {
      return (
        new Date(secondReview.updatedAt).getTime() -
        new Date(firstReview.updatedAt).getTime()
      );
    });

  visibleReviews.forEach((review) => {
    if (RATING_VALUES.includes(review.rating)) {
      ratingDistribution[review.rating] += 1;
    }
  });

  const totalReviewCount = visibleReviews.length;
  const totalRating = visibleReviews.reduce(
    (accumulator, review) => accumulator + review.rating,
    0
  );

  return {
    averageRating:
      totalReviewCount > 0
        ? Number((totalRating / totalReviewCount).toFixed(1))
        : 0,
    totalReviewCount,
    ratingDistribution,
    recentReviews: visibleReviews
      .slice(0, recentLimit)
      .map((review) => serializeReview(review)),
  };
}

function assertReviewEligibility({ user, productId, orders, existingReview }) {
  if (!user?._id) {
    throw createReviewError(401, "No token provided");
  }

  if (existingReview && existingReview.user?._id !== user._id) {
    throw createReviewError(403, "You can only edit your own review");
  }

  const eligibleOrder = orders.find((order) => {
    return (
      order.user?._id === user._id &&
      order.status === "delivered" &&
      order.items?.some((item) => item.productId?._id === productId)
    );
  });

  if (!eligibleOrder) {
    throw createReviewError(
      403,
      "Only verified purchasers can review this product"
    );
  }

  return eligibleOrder;
}

module.exports = {
  assertReviewEligibility,
  buildProductReviewSummary,
  createReviewError,
  serializeReview,
};
