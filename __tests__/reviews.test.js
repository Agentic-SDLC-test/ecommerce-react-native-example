import {
  ENABLE_REVIEWS,
  RATING_SCALE,
  MAX_REVIEW_LENGTH,
  isValidRating,
  computeRatingSummary,
} from "../constants/Reviews";

describe("Reviews constants", () => {
  it("exposes the reviews feature flag and config", () => {
    expect(ENABLE_REVIEWS).toBe(true);
    expect(RATING_SCALE).toEqual([1, 2, 3, 4, 5]);
    expect(MAX_REVIEW_LENGTH).toBe(1000);
  });

  it("accepts integer ratings within the 1-5 scale", () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(5)).toBe(true);
    expect(isValidRating(3)).toBe(true);
  });

  it("rejects out-of-range or non-integer ratings", () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(4.5)).toBe(false);
    expect(isValidRating("5")).toBe(false);
    expect(isValidRating(undefined)).toBe(false);
  });
});

describe("computeRatingSummary", () => {
  it("returns a zeroed summary for an empty list", () => {
    const summary = computeRatingSummary([]);
    expect(summary.average).toBe(0);
    expect(summary.total).toBe(0);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("computes average, total, and distribution over the supplied reviews", () => {
    const summary = computeRatingSummary([
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ]);
    expect(summary.total).toBe(3);
    expect(summary.average).toBe(4.7);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 });
  });

  it("rounds the average to one decimal place", () => {
    const summary = computeRatingSummary([{ rating: 5 }, { rating: 2 }]);
    expect(summary.average).toBe(3.5);
  });

  it("ignores out-of-range ratings in the distribution but counts them in total", () => {
    const summary = computeRatingSummary([{ rating: 5 }, { rating: 9 }]);
    expect(summary.total).toBe(2);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
  });

  it("tolerates a non-array argument", () => {
    const summary = computeRatingSummary(null);
    expect(summary.total).toBe(0);
    expect(summary.average).toBe(0);
  });
});
