function getCurrentUserFromRequest(req, users) {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return null;
  }
  return users.find((u) => u.token === token) || null;
}

function hasVerifiedPurchase(userId, productId, orders) {
  return orders.some(
    (order) =>
      order.user._id === userId &&
      order.status === "delivered" &&
      order.items.some((item) => item.productId._id === productId)
  );
}

function findReview(productId, userId, reviews) {
  return reviews.find(
    (review) => review.productId === productId && review.user._id === userId
  );
}

function validateReviewPayload(body) {
  const rating = body?.rating;
  const reviewText =
    typeof body?.reviewText === "string" ? body.reviewText.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { valid: false, message: "Rating must be an integer from 1 to 5" };
  }

  if (reviewText.length < 1 || reviewText.length > 500) {
    return {
      valid: false,
      message: "Review text must be between 1 and 500 characters",
    };
  }

  return { valid: true, rating, reviewText };
}

function serializeReview(review, includeEmail = false) {
  const dto = {
    _id: review._id,
    productId: review.productId,
    productTitle: review.productTitle,
    userName: review.user.name,
    rating: review.rating,
    reviewText: review.reviewText,
    verifiedPurchase: review.verifiedPurchase,
    visible: review.visible,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };

  if (includeEmail) {
    return {
      ...dto,
      userEmail: review.user.email,
      hiddenAt: review.hiddenAt,
      hiddenBy: review.hiddenBy,
    };
  }

  return dto;
}

function buildReviewSummary(productId, reviews) {
  const visibleReviews = reviews.filter(
    (review) => review.productId === productId && review.visible === true
  );

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;

  visibleReviews.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    ratingSum += review.rating;
  });

  const totalCount = visibleReviews.length;
  const averageRating =
    totalCount > 0 ? Math.round((ratingSum / totalCount) * 10) / 10 : 0;

  const recentReviews = [...visibleReviews]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map((review) => serializeReview(review));

  return {
    averageRating,
    totalCount,
    distribution,
    recentReviews,
  };
}

function getDeliveredOrderIds(userId, productId, orders) {
  return orders
    .filter(
      (order) =>
        order.user._id === userId &&
        order.status === "delivered" &&
        order.items.some((item) => item.productId._id === productId)
    )
    .map((order) => order._id);
}

module.exports = {
  getCurrentUserFromRequest,
  hasVerifiedPurchase,
  findReview,
  validateReviewPayload,
  buildReviewSummary,
  serializeReview,
  getDeliveredOrderIds,
};
