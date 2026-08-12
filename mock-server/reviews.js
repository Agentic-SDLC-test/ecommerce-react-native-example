// Review vocabulary, read-time defaults, write-time invariants, eligibility
// derivation and aggregation for the mock-server. Kept free of express so jest
// can require it even though /mock-server/ is excluded from test discovery.
//
// These enums must stay identical to constants/Reviews.js in the app bundle
// (the app cannot import server files). __tests__/mockServerReviews.test.js
// requires both and fails on drift.

const REVIEW_VISIBILITIES = {
  VISIBLE: "visible",
  HIDDEN: "hidden",
};

const REVIEW_ELIGIBILITY = {
  ELIGIBLE: "eligible",
  NOT_SIGNED_IN: "not_signed_in",
  NO_PURCHASE: "no_purchase",
  NOT_DELIVERED: "not_delivered",
  FEATURE_OFF: "feature_off",
};

const RATING_MIN = 1;
const RATING_MAX = 5;
const REVIEW_TEXT_MAX_LENGTH = 500;

const KNOWN_VISIBILITIES = Object.values(REVIEW_VISIBILITIES);

// Applied at read time so a row is never returned with an undefined visibility —
// and an unrecognised one is never treated as visible.
function withReviewDefaults(review) {
  const known = KNOWN_VISIBILITIES.includes(review.visibility);
  return {
    ...review,
    visibility: known ? review.visibility : REVIEW_VISIBILITIES.VISIBLE,
    verified_purchase: review.verified_purchase === true,
    text: review.text || "",
    moderated_by: review.moderated_by || null,
    moderated_at: review.moderated_at || null,
    moderation_action: review.moderation_action || null,
    updatedAt: review.updatedAt || review.createdAt || null,
  };
}

// The boundary check that stops an invalid row entering the store at all.
function validateReviewSubmission({ rating, text }) {
  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    return { valid: false, message: "Rating must be a whole number from 1 to 5" };
  }
  if (text && String(text).trim().length > REVIEW_TEXT_MAX_LENGTH) {
    return {
      valid: false,
      message: "Review text must be 500 characters or fewer",
    };
  }
  return { valid: true, message: "" };
}

// Derived from the caller's own orders at request time — the client cannot
// assert it. Reads orders only: never writes, and never touches a fulfilment or
// payment field.
function resolveEligibility({ orders, userId, productId }) {
  const ownOrders = (orders || []).filter((o) => o.user && o.user._id === userId);
  const withProduct = ownOrders.filter((o) =>
    (o.items || []).some(
      (item) => item.productId && item.productId._id === productId
    )
  );
  if (withProduct.length === 0) {
    return REVIEW_ELIGIBILITY.NO_PURCHASE;
  }
  if (!withProduct.some((o) => o.status === "delivered")) {
    return REVIEW_ELIGIBILITY.NOT_DELIVERED;
  }
  return REVIEW_ELIGIBILITY.ELIGIBLE;
}

// Identical arithmetic and identical `average: null` empty case as the client
// copy in utils/reviews.js, over visible rows only.
function summarizeReviews(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;

  (reviews || [])
    .filter((review) => review.visibility === REVIEW_VISIBILITIES.VISIBLE)
    .forEach((review) => {
      const rating = review.rating;
      if (
        Number.isInteger(rating) &&
        rating >= RATING_MIN &&
        rating <= RATING_MAX
      ) {
        distribution[rating] += 1;
        count += 1;
        sum += rating;
      }
    });

  return {
    count,
    average: count === 0 ? null : Math.round((sum / count) * 10) / 10,
    distribution,
  };
}

// The shopper-facing projection: a display name, the verdict and the date. No
// user object, no email, no order reference, no moderation metadata.
function publicReview(review) {
  const row = withReviewDefaults(review);
  return {
    _id: row._id,
    productId: row.productId,
    reviewer_name: row.reviewer_name,
    rating: row.rating,
    text: row.text,
    verified_purchase: row.verified_purchase,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// The moderation projection: the public fields plus who acted and when. Still no
// email — the row never stored one.
function adminReview(review) {
  const row = withReviewDefaults(review);
  return {
    ...publicReview(review),
    user: row.user ? { _id: row.user._id, name: row.user.name } : null,
    moderated_by: row.moderated_by,
    moderated_at: row.moderated_at,
    moderation_action: row.moderation_action,
  };
}

// Default-on, and takes the env object as an argument so it is testable without
// mutating process.env. This is the switch that cuts review content in seconds
// without an app release.
function isReviewsEnabled(env) {
  return (env || {}).REVIEWS_ENABLED !== "false";
}

module.exports = {
  REVIEW_VISIBILITIES,
  REVIEW_ELIGIBILITY,
  RATING_MIN,
  RATING_MAX,
  REVIEW_TEXT_MAX_LENGTH,
  withReviewDefaults,
  validateReviewSubmission,
  resolveEligibility,
  summarizeReviews,
  publicReview,
  adminReview,
  isReviewsEnabled,
};
