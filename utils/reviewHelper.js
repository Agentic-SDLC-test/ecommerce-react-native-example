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

export const truncateReviewComment = (comment, maxLength = 100) => {
  if (!comment) return "";
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength) + "...";
};
