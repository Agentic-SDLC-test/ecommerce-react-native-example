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

export const REVIEW_COMMENT_MAX_LENGTH = 500;

export const formatReviewDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatAverageRating = (avg) => Number(avg || 0).toFixed(1);

export const formatStarsLabel = (rating) => `${rating} out of 5 stars`;

export const buildDistributionRows = (distribution, totalCount) => {
  const stars = [5, 4, 3, 2, 1];
  return stars.map((star) => {
    const count = Number(distribution?.[String(star)]) || 0;
    const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { stars: star, count, percent };
  });
};

export const getReviewAction = ({ isEligible, hasReviewed, myReview }) => {
  if (myReview) return "edit";
  if (isEligible && !hasReviewed) return "write";
  return null;
};
