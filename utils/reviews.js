import colors from "../constants/Colors";
import {
  REVIEW_VISIBILITIES,
  REVIEW_ELIGIBILITY,
  ELIGIBILITY_MESSAGES,
  REVIEWS_EMPTY_STATE_TEXT,
  RATING_MIN,
  RATING_MAX,
  REVIEW_TEXT_MAX_LENGTH,
} from "../constants/Reviews";

// Pure review logic: feature enablement, read-side normalisation of rows that a
// backend without the review contract may not send at all, aggregation, draft
// validation and construction of the /review body. No React and no network
// here, so every rule below is unit-testable.

const KNOWN_VISIBILITIES = Object.values(REVIEW_VISIBILITIES);
const KNOWN_ELIGIBILITIES = Object.values(REVIEW_ELIGIBILITY);

// Read env the way utils/payment.js does — process may be absent in some
// bundles. Read at call time (not module load) so tests can vary the flag.
function envValue(name) {
  return (
    (typeof process !== "undefined" && process.env && process.env[name]) ||
    undefined
  );
}

// Default-on: the client flag's job is preview control and a rollback that
// rides an OTA push, so an unset value in a fresh clone must not hide the
// feature. The instant kill switch is REVIEWS_ENABLED on the server.
export function isReviewsEnabled() {
  return envValue("EXPO_PUBLIC_ENABLE_REVIEWS") !== "false";
}

// A row whose visibility is missing or unrecognised is treated as hidden, not
// visible — the same instinct as resolvePaymentStatus refusing to upgrade an
// unknown status to paid, applied to content trust instead of money.
export function resolveVisibility(review) {
  const visibility = review?.visibility;
  return KNOWN_VISIBILITIES.includes(visibility)
    ? visibility
    : REVIEW_VISIBILITIES.HIDDEN;
}

export function isVisible(review) {
  return resolveVisibility(review) === REVIEW_VISIBILITIES.VISIBLE;
}

// Tolerates null, undefined and a non-array body so a failed fetch collapses to
// the empty state rather than throwing on the product page.
export function visibleReviews(reviews) {
  return Array.isArray(reviews) ? reviews.filter(isVisible) : [];
}

// Explicit-true only: a malformed row is never badged as a verified purchase.
export function isVerifiedPurchase(review) {
  return review?.verified_purchase === true;
}

// Reads no email field under any circumstance — a review shows a display name
// and nothing else about the customer.
export function reviewerDisplayName(review) {
  return review?.reviewer_name || review?.user?.name || "Verified customer";
}

// The single function that produces the aggregate, over visible rows only, so a
// hidden review cannot linger in an average.
export function summarizeReviews(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;

  visibleReviews(reviews).forEach((review) => {
    const rating = review?.rating;
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

  // null, never 0 — so "0.0 stars" cannot render for a product nobody has
  // reviewed yet, which is the whole catalogue on day one.
  return {
    count,
    average: count === 0 ? null : Math.round((sum / count) * 10) / 10,
    distribution,
  };
}

export function formatAverage(average) {
  return Number.isFinite(average) ? average.toFixed(1) : null;
}

// Ratings are never colour-only: assistive technology gets the figure in words.
export function ratingSummaryAccessibilityLabel(summary) {
  if (!summary || summary.count === 0) {
    return REVIEWS_EMPTY_STATE_TEXT;
  }
  const noun = summary.count === 1 ? "review" : "reviews";
  return `${formatAverage(summary.average)} out of 5, ${summary.count} ${noun}`;
}

export function distributionRows(summary) {
  const rows = [];
  for (let rating = RATING_MAX; rating >= RATING_MIN; rating -= 1) {
    const bucket = summary?.distribution?.[rating] || 0;
    rows.push({
      rating,
      count: bucket,
      percent: !summary?.count ? 0 : Math.round((bucket / summary.count) * 100),
    });
  }
  return rows;
}

// Client-side validation is a UX affordance; the server check is the authority.
export function validateReviewDraft({ rating, text }) {
  if (
    !Number.isInteger(rating) ||
    rating < RATING_MIN ||
    rating > RATING_MAX
  ) {
    return { valid: false, message: "Select a rating from 1 to 5 stars" };
  }
  if (text && String(text).trim().length > REVIEW_TEXT_MAX_LENGTH) {
    return { valid: false, message: "Keep your review under 500 characters" };
  }
  return { valid: true, message: "" };
}

// Builds the POST /review body. Emits exactly three keys — no user id, no email,
// no order reference, no timestamps — a key set asserted in
// __tests__/reviews.test.js so that stays structurally true.
export function buildReviewPayload({ productId, rating, text }) {
  if (!productId) {
    throw new Error("Cannot submit a review without a product");
  }
  if (
    !Number.isInteger(rating) ||
    rating < RATING_MIN ||
    rating > RATING_MAX
  ) {
    throw new Error("Invalid review rating: " + rating);
  }

  return {
    productId,
    rating,
    text: text ? String(text).trim() : "",
  };
}

// Fails closed: an unrecognised or missing eligibility never presents a form.
export function resolveEligibility(response) {
  const eligibility = response?.data?.eligibility;
  return KNOWN_ELIGIBILITIES.includes(eligibility)
    ? eligibility
    : REVIEW_ELIGIBILITY.NO_PURCHASE;
}

export function canSubmitReview(eligibility) {
  return eligibility === REVIEW_ELIGIBILITY.ELIGIBLE;
}

export function eligibilityMessage(eligibility) {
  return (
    ELIGIBILITY_MESSAGES[eligibility] ||
    ELIGIBILITY_MESSAGES[REVIEW_ELIGIBILITY.NO_PURCHASE]
  );
}

// Only palette values from constants/Colors — no new hex literals in new code.
export function reviewVisibilityTone(review) {
  if (resolveVisibility(review) === REVIEW_VISIBILITIES.VISIBLE) {
    return { backgroundColor: colors.tertiary, textColor: colors.dark };
  }
  return { backgroundColor: colors.shadow, textColor: colors.muted };
}
