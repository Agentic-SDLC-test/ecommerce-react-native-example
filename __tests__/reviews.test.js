import colors from "../constants/Colors";
import {
  REVIEW_VISIBILITIES,
  REVIEW_ELIGIBILITY,
  RATING_MAX,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEWS_EMPTY_STATE_TEXT,
} from "../constants/Reviews";
import {
  isReviewsEnabled,
  resolveVisibility,
  isVisible,
  visibleReviews,
  isVerifiedPurchase,
  reviewerDisplayName,
  summarizeReviews,
  formatAverage,
  ratingSummaryAccessibilityLabel,
  distributionRows,
  validateReviewDraft,
  buildReviewPayload,
  resolveEligibility,
  canSubmitReview,
  eligibilityMessage,
  reviewVisibilityTone,
} from "../utils/reviews";

const visibleRow = (rating, extra = {}) => ({
  rating,
  visibility: "visible",
  verified_purchase: true,
  reviewer_name: "John Doe",
  ...extra,
});

describe("review vocabulary", () => {
  it("distinguishes the two visibility states", () => {
    expect(Object.values(REVIEW_VISIBILITIES)).toEqual(["visible", "hidden"]);
  });

  it("names every reason a shopper may not review", () => {
    expect(Object.values(REVIEW_ELIGIBILITY)).toEqual([
      "eligible",
      "not_signed_in",
      "no_purchase",
      "not_delivered",
      "feature_off",
    ]);
  });

  it("caps ratings at 5 stars and text at 500 characters", () => {
    expect(RATING_MAX).toBe(5);
    expect(REVIEW_TEXT_MAX_LENGTH).toBe(500);
  });
});

describe("reviews flag", () => {
  const previous = process.env.EXPO_PUBLIC_ENABLE_REVIEWS;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_REVIEWS;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_REVIEWS = previous;
    }
  });

  it("is on when the flag is unset", () => {
    delete process.env.EXPO_PUBLIC_ENABLE_REVIEWS;
    expect(isReviewsEnabled()).toBe(true);
  });

  it('is off only when the flag is exactly "false"', () => {
    process.env.EXPO_PUBLIC_ENABLE_REVIEWS = "false";
    expect(isReviewsEnabled()).toBe(false);
    process.env.EXPO_PUBLIC_ENABLE_REVIEWS = "0";
    expect(isReviewsEnabled()).toBe(true);
    process.env.EXPO_PUBLIC_ENABLE_REVIEWS = "true";
    expect(isReviewsEnabled()).toBe(true);
  });
});

describe("resolveVisibility", () => {
  it("keeps a known visibility", () => {
    expect(resolveVisibility({ visibility: "visible" })).toBe("visible");
    expect(resolveVisibility({ visibility: "hidden" })).toBe("hidden");
  });

  it("treats a missing or unknown visibility as hidden", () => {
    expect(resolveVisibility({})).toBe(REVIEW_VISIBILITIES.HIDDEN);
    expect(resolveVisibility({ visibility: "pending" })).toBe(
      REVIEW_VISIBILITIES.HIDDEN
    );
    expect(resolveVisibility({ visibility: "" })).toBe(
      REVIEW_VISIBILITIES.HIDDEN
    );
  });

  it("does not throw on a null review", () => {
    expect(() => resolveVisibility(null)).not.toThrow();
    expect(resolveVisibility(null)).toBe(REVIEW_VISIBILITIES.HIDDEN);
    expect(resolveVisibility(undefined)).toBe(REVIEW_VISIBILITIES.HIDDEN);
    expect(isVisible(null)).toBe(false);
  });
});

describe("visibleReviews", () => {
  it("filters hidden rows out", () => {
    const rows = [
      visibleRow(5),
      { rating: 2, visibility: "hidden" },
      visibleRow(3),
    ];
    expect(visibleReviews(rows)).toHaveLength(2);
  });

  it("collapses a failed fetch to an empty list", () => {
    [null, undefined, {}, "", 0].forEach((body) => {
      expect(visibleReviews(body)).toEqual([]);
    });
  });
});

describe("isVerifiedPurchase", () => {
  it("badges only an explicitly verified row", () => {
    expect(isVerifiedPurchase({ verified_purchase: true })).toBe(true);
  });

  it("never badges a malformed row", () => {
    [{}, null, undefined, { verified_purchase: "true" }, { verified_purchase: 1 }].forEach(
      (review) => {
        expect(isVerifiedPurchase(review)).toBe(false);
      }
    );
  });
});

describe("reviewerDisplayName", () => {
  it("prefers the stored display name", () => {
    expect(reviewerDisplayName({ reviewer_name: "Jane Smith" })).toBe(
      "Jane Smith"
    );
  });

  it("falls back to the embedded user name, then to a neutral label", () => {
    expect(reviewerDisplayName({ user: { name: "Jane Smith" } })).toBe(
      "Jane Smith"
    );
    expect(reviewerDisplayName({})).toBe("Verified customer");
    expect(reviewerDisplayName(null)).toBe("Verified customer");
  });

  it("never reads an email field", () => {
    expect(
      reviewerDisplayName({ user: { email: "jane@easybuy.com" } })
    ).toBe("Verified customer");
  });
});

describe("summarizeReviews", () => {
  it("returns a null average for a product with no reviews", () => {
    const summary = summarizeReviews([]);

    expect(summary.count).toBe(0);
    expect(summary.average).toBeNull();
    expect(summary.average).not.toBe(0);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("returns a null average when every row is hidden", () => {
    const summary = summarizeReviews([
      { rating: 5, visibility: "hidden" },
      { rating: 1, visibility: "hidden" },
    ]);

    expect(summary.count).toBe(0);
    expect(summary.average).toBeNull();
  });

  it("averages the visible rows to one decimal", () => {
    const summary = summarizeReviews([
      visibleRow(5),
      visibleRow(4),
      visibleRow(4),
    ]);

    expect(summary.count).toBe(3);
    expect(summary.average).toBe(4.3);
  });

  it("excludes hidden rows from count, average and distribution", () => {
    const summary = summarizeReviews([
      visibleRow(5),
      visibleRow(5),
      { rating: 1, visibility: "hidden" },
    ]);

    expect(summary.count).toBe(2);
    expect(summary.average).toBe(5);
    expect(summary.distribution[1]).toBe(0);
    expect(summary.distribution[5]).toBe(2);
  });

  it("ignores a rating that is not a whole number in range", () => {
    const summary = summarizeReviews([
      visibleRow(4),
      visibleRow(0),
      visibleRow(6),
      visibleRow(4.5),
      visibleRow("4"),
    ]);

    expect(summary.count).toBe(1);
    expect(summary.average).toBe(4);
  });

  it("tolerates a null or non-array body", () => {
    expect(summarizeReviews(null).average).toBeNull();
    expect(summarizeReviews(undefined).count).toBe(0);
    expect(summarizeReviews("nope").count).toBe(0);
  });
});

describe("formatAverage", () => {
  it("returns null for an absent average so no 0.0 can render", () => {
    expect(formatAverage(null)).toBeNull();
    expect(formatAverage(undefined)).toBeNull();
    expect(formatAverage(NaN)).toBeNull();
  });

  it("formats to one decimal", () => {
    expect(formatAverage(4.25)).toBe("4.3");
    expect(formatAverage(5)).toBe("5.0");
  });
});

describe("ratingSummaryAccessibilityLabel", () => {
  it("reads the figure out in words", () => {
    expect(
      ratingSummaryAccessibilityLabel({ count: 37, average: 4.2 })
    ).toBe("4.2 out of 5, 37 reviews");
  });

  it("uses the singular for a single review", () => {
    expect(ratingSummaryAccessibilityLabel({ count: 1, average: 5 })).toBe(
      "5.0 out of 5, 1 review"
    );
  });

  it("falls back to the empty state text", () => {
    expect(
      ratingSummaryAccessibilityLabel({ count: 0, average: null })
    ).toBe(REVIEWS_EMPTY_STATE_TEXT);
    expect(ratingSummaryAccessibilityLabel(null)).toBe(
      REVIEWS_EMPTY_STATE_TEXT
    );
  });
});

describe("distributionRows", () => {
  it("returns five rows, highest rating first", () => {
    const rows = distributionRows(summarizeReviews([]));

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.rating)).toEqual([5, 4, 3, 2, 1]);
    expect(rows.every((row) => row.percent === 0)).toBe(true);
  });

  it("converts each bucket to a percentage of the visible total", () => {
    const summary = summarizeReviews([
      visibleRow(5),
      visibleRow(5),
      visibleRow(3),
      visibleRow(1),
    ]);
    const rows = distributionRows(summary);

    expect(rows).toEqual([
      { rating: 5, count: 2, percent: 50 },
      { rating: 4, count: 0, percent: 0 },
      { rating: 3, count: 1, percent: 25 },
      { rating: 2, count: 0, percent: 0 },
      { rating: 1, count: 1, percent: 25 },
    ]);
    expect(rows.reduce((sum, row) => sum + row.percent, 0)).toBe(100);
  });
});

describe("validateReviewDraft", () => {
  it("accepts a rating with no text", () => {
    expect(validateReviewDraft({ rating: 4 })).toEqual({
      valid: true,
      message: "",
    });
    expect(validateReviewDraft({ rating: 1, text: "" })).toEqual({
      valid: true,
      message: "",
    });
  });

  it("accepts text at exactly the limit", () => {
    expect(
      validateReviewDraft({ rating: 4, text: "a".repeat(500) }).valid
    ).toBe(true);
  });

  it("rejects a rating outside 1 to 5", () => {
    [0, 6, -1].forEach((rating) => {
      const result = validateReviewDraft({ rating });
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Select a rating from 1 to 5 stars");
    });
  });

  it("rejects a rating that is not a whole number", () => {
    expect(validateReviewDraft({ rating: 4.5 }).valid).toBe(false);
    expect(validateReviewDraft({ rating: "4" }).valid).toBe(false);
    expect(validateReviewDraft({}).valid).toBe(false);
  });

  it("rejects text over the limit", () => {
    const result = validateReviewDraft({ rating: 4, text: "a".repeat(501) });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Keep your review under 500 characters");
  });
});

describe("buildReviewPayload", () => {
  it("returns the exact expected key set", () => {
    const payload = buildReviewPayload({
      productId: "prod001",
      rating: 4,
      text: "Good value, slightly loose fit.",
    });

    expect(Object.keys(payload).sort()).toEqual(
      ["productId", "rating", "text"].sort()
    );
  });

  it("carries no identifier of any kind", () => {
    const payload = buildReviewPayload({ productId: "prod001", rating: 5 });

    Object.keys(payload).forEach((key) => {
      expect(key).not.toMatch(/email|order|user|token/i);
    });
  });

  it("trims the text and emits an empty string when absent", () => {
    expect(
      buildReviewPayload({ productId: "prod001", rating: 5, text: "  ok  " })
        .text
    ).toBe("ok");
    expect(buildReviewPayload({ productId: "prod001", rating: 5 }).text).toBe(
      ""
    );
  });

  it("throws without a product", () => {
    expect(() => buildReviewPayload({ rating: 5 })).toThrow(
      "Cannot submit a review without a product"
    );
  });

  it("throws on an out-of-range rating", () => {
    expect(() =>
      buildReviewPayload({ productId: "prod001", rating: 6 })
    ).toThrow("Invalid review rating: 6");
    expect(() =>
      buildReviewPayload({ productId: "prod001", rating: 0 })
    ).toThrow("Invalid review rating: 0");
  });
});

describe("resolveEligibility", () => {
  it("reads a known eligibility off the response", () => {
    expect(resolveEligibility({ data: { eligibility: "eligible" } })).toBe(
      REVIEW_ELIGIBILITY.ELIGIBLE
    );
    expect(resolveEligibility({ data: { eligibility: "not_delivered" } })).toBe(
      REVIEW_ELIGIBILITY.NOT_DELIVERED
    );
  });

  it("fails closed on a missing or unknown eligibility", () => {
    [{}, null, undefined, { data: {} }, { data: { eligibility: "maybe" } }].forEach(
      (response) => {
        expect(resolveEligibility(response)).toBe(
          REVIEW_ELIGIBILITY.NO_PURCHASE
        );
      }
    );
  });
});

describe("canSubmitReview and eligibilityMessage", () => {
  it("only lets an eligible shopper submit", () => {
    expect(canSubmitReview(REVIEW_ELIGIBILITY.ELIGIBLE)).toBe(true);
    [
      REVIEW_ELIGIBILITY.NOT_SIGNED_IN,
      REVIEW_ELIGIBILITY.NO_PURCHASE,
      REVIEW_ELIGIBILITY.NOT_DELIVERED,
      REVIEW_ELIGIBILITY.FEATURE_OFF,
    ].forEach((eligibility) => {
      expect(canSubmitReview(eligibility)).toBe(false);
    });
  });

  it("gives a distinct reason for every eligibility value", () => {
    const messages = Object.values(REVIEW_ELIGIBILITY).map(eligibilityMessage);

    messages.forEach((message) => expect(message).toBeTruthy());
    expect(eligibilityMessage(REVIEW_ELIGIBILITY.NO_PURCHASE)).toBe(
      "Only customers who bought this product can review it"
    );
    expect(eligibilityMessage(REVIEW_ELIGIBILITY.NOT_DELIVERED)).toBe(
      "You can review this product once your order has been delivered"
    );
  });

  it("falls back to the no-purchase reason for an unknown value", () => {
    expect(eligibilityMessage("weird")).toBe(
      "Only customers who bought this product can review it"
    );
  });
});

describe("reviewVisibilityTone", () => {
  it("tones a visible and a hidden review differently", () => {
    expect(reviewVisibilityTone({ visibility: "visible" })).toEqual({
      backgroundColor: colors.tertiary,
      textColor: colors.dark,
    });
    expect(reviewVisibilityTone({ visibility: "hidden" })).toEqual({
      backgroundColor: colors.shadow,
      textColor: colors.muted,
    });
  });

  it("uses palette values only", () => {
    const palette = Object.values(colors);

    [{ visibility: "visible" }, { visibility: "hidden" }, null].forEach(
      (review) => {
        const tone = reviewVisibilityTone(review);
        expect(palette).toContain(tone.backgroundColor);
        expect(palette).toContain(tone.textColor);
      }
    );
  });
});
