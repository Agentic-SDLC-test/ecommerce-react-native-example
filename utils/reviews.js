// Pure presentation and validation helpers for product reviews. Imports
// nothing from react-native so the components and the unit suite can share
// them without any native module in the way.

export const REVIEW_COMMENT_MAX_LENGTH = 500;
export const REVIEW_PAGE_SIZE = 5;
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const RATING_REQUIRED_MESSAGE =
  "Please choose a star rating before submitting.";

// Render the average to one decimal place; "" when there is nothing to show.
export function formatAverage(average) {
  if (average === null || average === undefined) return "";
  const value = Number(average);
  if (!Number.isFinite(value)) return "";
  return value.toFixed(1);
}

// Five star states for a possibly fractional value, so 3.5 shows a half star.
export function starStates(value) {
  const score = Number(value);
  const safe = Number.isFinite(score) ? score : 0;
  const states = [];
  for (let i = 0; i < MAX_RATING; i++) {
    if (safe >= i + 1) {
      states.push("full");
    } else if (safe >= i + 0.5) {
      states.push("half");
    } else {
      states.push("empty");
    }
  }
  return states;
}

// Map a star state to its Ionicons name.
export function starIconName(state) {
  if (state === "full") return "star";
  if (state === "half") return "star-half";
  return "star-outline";
}

// A rating is a whole number of stars — 0, 6, 2.5 and "3" are all invalid.
export function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING;
}

// The verified badge is a factual claim, so it renders only on an explicit
// true — a missing or false flag must never earn one.
export function isVerifiedPurchase(review) {
  return review?.verifiedPurchase === true;
}

// Bound the comment to what the server will store.
export function clampComment(text) {
  if (text === null || text === undefined) return "";
  return String(text).slice(0, REVIEW_COMMENT_MAX_LENGTH);
}

// Remaining allowance for the live counter; never negative.
export function remainingCommentChars(text) {
  return REVIEW_COMMENT_MAX_LENGTH - clampComment(text).length;
}

// Same visual date format as order rows (dd-mm-yyyy, local time).
export function formatReviewDate(value) {
  if (!value) return "";
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return "";
  const date = ("0" + t.getDate()).slice(-2);
  const month = ("0" + (t.getMonth() + 1)).slice(-2);
  const year = t.getFullYear();
  return `${date}-${month}-${year}`;
}

// Human-readable rating count for the aggregate line.
export function reviewCountLabel(count) {
  if (!count) return "No ratings";
  if (count === 1) return "1 rating";
  return `${count} ratings`;
}

// Build-time kill switch for both review surfaces; on unless explicitly "false".
export function areReviewsEnabled() {
  const value =
    typeof process !== "undefined" &&
    process.env &&
    process.env.EXPO_PUBLIC_REVIEWS_ENABLED;
  return value !== "false";
}
