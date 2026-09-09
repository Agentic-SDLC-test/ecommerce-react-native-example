import {
  formatReviewerName,
  calculateAverageRating,
  calculateRatingDistribution,
  truncateReviewComment,
} from "../utils/reviewHelper";

describe("Review helper utilities", () => {
  describe("formatReviewerName", () => {
    it("formats a full name to first name and last initial", () => {
      expect(formatReviewerName("John Doe")).toBe("John D.");
      expect(formatReviewerName("Jane Alice Smith")).toBe("Jane S.");
    });

    it("handles a single name without a last initial", () => {
      expect(formatReviewerName("Alex")).toBe("Alex");
      expect(formatReviewerName("")).toBe("Anonymous");
      expect(formatReviewerName(undefined)).toBe("Anonymous");
    });

    it("handles extra whitespace gracefully", () => {
      expect(formatReviewerName("  John   Doe  ")).toBe("John D.");
    });
  });

  describe("calculateAverageRating", () => {
    it("calculates the correct average rounded to one decimal place", () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 4 },
      ];
      expect(calculateAverageRating(reviews)).toBe(4.3);
    });

    it("returns 0.0 for an empty or missing list of reviews", () => {
      expect(calculateAverageRating([])).toBe(0.0);
      expect(calculateAverageRating(null)).toBe(0.0);
    });

    it("handles integer averages properly", () => {
      const reviews = [
        { rating: 5 },
        { rating: 5 },
      ];
      expect(calculateAverageRating(reviews)).toBe(5.0);
    });
  });

  describe("calculateRatingDistribution", () => {
    it("returns an all-zero 1..5 map for an empty or missing list", () => {
      const zero = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      expect(calculateRatingDistribution([])).toEqual(zero);
      expect(calculateRatingDistribution(null)).toEqual(zero);
      expect(calculateRatingDistribution(undefined)).toEqual(zero);
    });

    it("buckets ratings correctly across the five star levels", () => {
      const reviews = [
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: 1 },
      ];
      expect(calculateRatingDistribution(reviews)).toEqual({
        1: 1,
        2: 0,
        3: 1,
        4: 1,
        5: 2,
      });
    });

    it("ignores out-of-range ratings defensively", () => {
      const reviews = [
        { rating: 0 },
        { rating: 6 },
        { rating: 3 },
      ];
      expect(calculateRatingDistribution(reviews)).toEqual({
        1: 0,
        2: 0,
        3: 1,
        4: 0,
        5: 0,
      });
    });
  });

  describe("truncateReviewComment", () => {
    it("truncates comments exceeding the maximum length", () => {
      const longComment = "This is a very long review comment that should be truncated because it exceeds the specified maximum character limit of fifty.";
      expect(truncateReviewComment(longComment, 50)).toBe("This is a very long review comment that should be ...");
    });

    it("keeps comments shorter than the limit intact", () => {
      expect(truncateReviewComment("Excellent product!", 50)).toBe("Excellent product!");
    });

    it("handles empty comments gracefully", () => {
      expect(truncateReviewComment("")).toBe("");
      expect(truncateReviewComment(undefined)).toBe("");
    });
  });
});
