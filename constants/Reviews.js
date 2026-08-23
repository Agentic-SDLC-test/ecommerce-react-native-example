// Ratings & reviews shared config and pure helpers.
// The backend is the authority for public aggregates and verified-purchase
// status; computeRatingSummary mirrors the same math client-side for
// defensive display and is the jest unit-test target.

/** Feature flag gating the reviews UI (mirrors ENABLE_DIGITAL_PAYMENT). */
export const ENABLE_REVIEWS = true;

/** Allowed star ratings, low to high. */
export const RATING_SCALE = [1, 2, 3, 4, 5];

/** Maximum length of a written review comment. */
export const MAX_REVIEW_LENGTH = 1000;

/** True when n is an integer star rating in the 1-5 scale. */
export const isValidRating = (n) =>
  Number.isInteger(n) && n >= 1 && n <= 5;

/**
 * Aggregate a list of reviews into { average, total, distribution }.
 * average is rounded to 1 decimal; distribution is keyed "1".."5".
 * Callers pass only the reviews they want counted (visible ones).
 */
export const computeRatingSummary = (reviews) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const list = Array.isArray(reviews) ? reviews : [];
  let sum = 0;
  list.forEach((r) => {
    if (isValidRating(r?.rating)) {
      distribution[r.rating] += 1;
      sum += r.rating;
    }
  });
  const total = list.length;
  const average = total === 0 ? 0 : Math.round((sum / total) * 10) / 10;
  return { average, total, distribution };
};
