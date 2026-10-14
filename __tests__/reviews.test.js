import {
  formatAverage,
  distributionRows,
  eligibilityMessage,
  formatReviewDate,
  reviewCountLabel,
} from "../utils/reviews";
import { ReviewEligibility } from "@agentic-sdlc-test/easybuy-api-client/domain";

describe("formatAverage", () => {
  it("returns an empty string when there is no average", () => {
    expect(formatAverage(null)).toBe("");
  });

  it("formats to one decimal place", () => {
    expect(formatAverage(4)).toBe("4.0");
    expect(formatAverage(4.3)).toBe("4.3");
  });
});

describe("distributionRows", () => {
  it("returns 5-to-1 order with zeroed counts and percentages when there is no summary", () => {
    const rows = distributionRows(null);
    expect(rows.map((r) => r.stars)).toEqual([5, 4, 3, 2, 1]);
    expect(rows.every((r) => r.count === 0 && r.percent === 0)).toBe(true);
  });

  it("computes percentages against the total count", () => {
    const summary = { count: 4, distribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 } };
    const rows = distributionRows(summary);
    expect(rows).toEqual([
      { stars: 5, count: 2, percent: 50 },
      { stars: 4, count: 1, percent: 25 },
      { stars: 3, count: 1, percent: 25 },
      { stars: 2, count: 0, percent: 0 },
      { stars: 1, count: 0, percent: 0 },
    ]);
  });
});

describe("eligibilityMessage", () => {
  it("maps NOT_DELIVERED", () => {
    expect(eligibilityMessage(ReviewEligibility.NOT_DELIVERED)).toBe(
      "You can review this product once your order is delivered."
    );
  });

  it("maps NOT_PURCHASED", () => {
    expect(eligibilityMessage(ReviewEligibility.NOT_PURCHASED)).toBe(
      "Only customers who have received this product can review it."
    );
  });

  it("maps anything else (eligible, null) to an empty string", () => {
    expect(eligibilityMessage(ReviewEligibility.ELIGIBLE)).toBe("");
    expect(eligibilityMessage(null)).toBe("");
  });
});

describe("reviewCountLabel", () => {
  it("singularizes for exactly 1", () => {
    expect(reviewCountLabel(1)).toBe("1 review");
  });

  it("pluralizes otherwise", () => {
    expect(reviewCountLabel(2)).toBe("2 reviews");
    expect(reviewCountLabel(0)).toBe("0 reviews");
  });
});

describe("formatReviewDate", () => {
  it("returns an empty string for a falsy input", () => {
    expect(formatReviewDate(null)).toBe("");
    expect(formatReviewDate("")).toBe("");
  });

  it("formats an ISO timestamp at midday UTC the same in every timezone", () => {
    expect(formatReviewDate("2024-01-23T12:00:00.000Z")).toBe("Jan 23, 2024");
  });
});
