export const validateReview = (rating, comment) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Select a rating between 1 and 5";
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : "";

  if (!trimmedComment) {
    return "Comment is required";
  }

  if (trimmedComment.length > 500) {
    return "Comment must be 500 characters or less";
  }

  return "";
};

export const filterReviews = (reviews, searchTerm) => {
  const keyword = searchTerm.trim().toLowerCase();

  if (!keyword) {
    return reviews;
  }

  return reviews.filter((review) => {
    return (
      review?.product?.title?.toLowerCase().includes(keyword) ||
      review?.user?.email?.toLowerCase().includes(keyword) ||
      review?.comment?.toLowerCase().includes(keyword)
    );
  });
};
