// The single source of the review vocabulary. Every shopper- and staff-facing
// review string lives here so the product page, the submission screen, the
// moderation screen and the server cannot drift apart.
//
// The mock-server keeps its own CommonJS copy of the enums
// (mock-server/reviews.js) because the Expo bundle must not import server
// files. __tests__/mockServerReviews.test.js asserts the two stay identical.

// Visibility is a third independent axis, alongside order fulfilment and
// payment — moderating a review must never move either of those.
export const REVIEW_VISIBILITIES = Object.freeze({
  VISIBLE: "visible",
  HIDDEN: "hidden",
});

export const REVIEW_ELIGIBILITY = Object.freeze({
  ELIGIBLE: "eligible",
  NOT_SIGNED_IN: "not_signed_in",
  NO_PURCHASE: "no_purchase",
  NOT_DELIVERED: "not_delivered",
  FEATURE_OFF: "feature_off",
});

export const MODERATION_ACTIONS = Object.freeze({
  HIDE: "hide",
  RESTORE: "restore",
  REMOVE: "remove",
});

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const REVIEW_TEXT_MAX_LENGTH = 500;
export const RECENT_REVIEWS_PAGE_SIZE = 5;
export const RECENT_REVIEWS_MAX_PAGE_SIZE = 50;

export const VERIFIED_PURCHASE_LABEL = "Verified Purchase";
export const REVIEWS_EMPTY_STATE_TEXT = "No reviews yet";
export const REVIEWS_UNAVAILABLE_TEXT = "Reviews are unavailable right now";
export const REVIEW_HIDDEN_AUTHOR_NOTICE =
  "This review is under review and is not shown to other shoppers";

// The reason a shopper cannot review yet. `not_delivered` tells them to come
// back; `no_purchase` tells them not to — the distinction matters.
export const ELIGIBILITY_MESSAGES = {
  eligible: "Share your experience with this product",
  not_signed_in: "Sign in to review a product you have bought",
  no_purchase: "Only customers who bought this product can review it",
  not_delivered:
    "You can review this product once your order has been delivered",
  feature_off: REVIEWS_UNAVAILABLE_TEXT,
};

export const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export const MODERATION_LABELS = {
  hide: "Hide",
  restore: "Restore",
  remove: "Remove",
  hidden_badge: "Hidden",
  visible_badge: "Visible",
};

export const REMOVE_CONFIRM_TEXT =
  "Removing a review is permanent. Hide it instead if you may want it back.";

const reviews = {
  REVIEW_VISIBILITIES,
  REVIEW_ELIGIBILITY,
  MODERATION_ACTIONS,
  RATING_MIN,
  RATING_MAX,
  REVIEW_TEXT_MAX_LENGTH,
  RECENT_REVIEWS_PAGE_SIZE,
  RECENT_REVIEWS_MAX_PAGE_SIZE,
  VERIFIED_PURCHASE_LABEL,
  REVIEWS_EMPTY_STATE_TEXT,
  REVIEWS_UNAVAILABLE_TEXT,
  REVIEW_HIDDEN_AUTHOR_NOTICE,
  ELIGIBILITY_MESSAGES,
  RATING_LABELS,
  MODERATION_LABELS,
  REMOVE_CONFIRM_TEXT,
};

export default reviews;
