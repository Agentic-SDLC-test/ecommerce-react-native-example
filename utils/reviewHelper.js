export const formatReviewerName = (fullName) => {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
};

export const calculateAverageRating = (reviewsList) => {
  if (!reviewsList || reviewsList.length === 0) return 0.0;
  const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
  return parseFloat((sum / reviewsList.length).toFixed(1));
};

export const calculateRatingDistribution = (reviewsList) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!reviewsList || reviewsList.length === 0) return distribution;
  reviewsList.forEach((r) => {
    const rating = r?.rating;
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      distribution[rating] += 1;
    }
  });
  return distribution;
};

export const truncateReviewComment = (comment, maxLength = 100) => {
  if (!comment) return "";
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength) + "...";
};
