import {
  formatReviewerName,
  calculateAverageRating,
  truncateReviewComment,
  formatReviewDate,
  formatAverageRating,
  formatStarsLabel,
  buildDistributionRows,
  getReviewAction,
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

  describe("formatReviewDate", () => {
    it("formats an ISO date string to DD-MM-YYYY", () => {
      expect(formatReviewDate("2026-08-21T12:00:00Z")).toMatch(/^\d{2}-\d{2}-2026$/);
    });

    it("returns an empty string for an empty value", () => {
      expect(formatReviewDate("")).toBe("");
    });
  });

  describe("formatAverageRating", () => {
    it("formats to one decimal place", () => {
      expect(formatAverageRating(5)).toBe("5.0");
    });

    it("defaults a missing value to 0.0", () => {
      expect(formatAverageRating(undefined)).toBe("0.0");
    });
  });

  describe("formatStarsLabel", () => {
    it("builds the accessibility label", () => {
      expect(formatStarsLabel(4)).toBe("4 out of 5 stars");
    });
  });

  describe("buildDistributionRows", () => {
    it("orders rows from 5 to 1 stars with rounded percentages", () => {
      const rows = buildDistributionRows({ 5: 1, 4: 2 }, 3);
      expect(rows.map((r) => r.stars)).toEqual([5, 4, 3, 2, 1]);
      expect(rows[0]).toEqual({ stars: 5, count: 1, percent: 33 });
      expect(rows[1]).toEqual({ stars: 4, count: 2, percent: 67 });
    });

    it("defaults missing keys to zero", () => {
      const rows = buildDistributionRows({ 5: 1 }, 1);
      expect(rows.find((r) => r.stars === 3)).toEqual({ stars: 3, count: 0, percent: 0 });
    });

    it("gives all-zero percents when totalCount is 0", () => {
      const rows = buildDistributionRows(null, 0);
      expect(rows.every((r) => r.percent === 0)).toBe(true);
    });
  });

  describe("getReviewAction", () => {
    it("returns edit when the caller already has a review", () => {
      expect(getReviewAction({ isEligible: true, hasReviewed: true, myReview: { _id: "r1" } })).toBe("edit");
    });

    it("returns write when eligible and not yet reviewed", () => {
      expect(getReviewAction({ isEligible: true, hasReviewed: false, myReview: null })).toBe("write");
    });

    it("returns null when ineligible", () => {
      expect(getReviewAction({ isEligible: false, hasReviewed: false, myReview: null })).toBe(null);
    });

    it("returns null when hasReviewed but myReview is missing", () => {
      expect(getReviewAction({ isEligible: true, hasReviewed: true, myReview: null })).toBe(null);
    });
  });
});
