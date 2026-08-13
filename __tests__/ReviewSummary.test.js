import React from "react";
import renderer from "react-test-renderer";
import ReviewSummary from "../components/ReviewSummary/ReviewSummary";

describe("ReviewSummary", () => {
  it("renders average rating and review count", () => {
    const summary = {
      averageRating: 4.5,
      totalReviews: 2,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
      recentReviews: [],
    };
    const tree = renderer.create(
      <ReviewSummary summary={summary} testID="review-summary" />
    );
    const average = tree.root.findByProps({ testID: "review-summary-average" });
    const count = tree.root.findByProps({ testID: "review-summary-count" });
    expect(average.props.children).toBe("4.5");
    expect(count.props.children).toEqual([2, " reviews"]);
  });

  it("renders distribution rows for empty reviews", () => {
    const summary = {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentReviews: [],
    };
    const tree = renderer.create(
      <ReviewSummary summary={summary} testID="review-summary" />
    );
    expect(tree.root.findByProps({ testID: "review-summary-bar-5" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "review-summary-row-1" })).toBeTruthy();
  });
});
