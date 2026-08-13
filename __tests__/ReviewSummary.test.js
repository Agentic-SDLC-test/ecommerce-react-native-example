import React from "react";
import { render } from "@testing-library/react-native";
import ReviewSummary from "../components/Reviews/ReviewSummary";

describe("ReviewSummary", () => {
  const summary = {
    averageRating: 4.3,
    totalReviews: 12,
    distribution: { 1: 0, 2: 1, 3: 2, 4: 4, 5: 5 },
  };

  it("renders average rating and count", () => {
    const { getByTestId } = render(
      <ReviewSummary summary={summary} testID="review-summary" />
    );
    expect(getByTestId("review-summary-average").props.children).toBe("4.3");
    expect(getByTestId("review-summary-count").props.children).toBe("12 reviews");
  });

  it("shows empty state when no reviews", () => {
    const emptySummary = {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
    const { getByTestId } = render(
      <ReviewSummary summary={emptySummary} testID="review-summary" />
    );
    expect(getByTestId("review-summary-count").props.children).toBe("No reviews yet");
    expect(getByTestId("review-summary-average").props.children).toBe("0.0");
  });

  it("renders distribution rows for each star level", () => {
    const { getByTestId } = render(
      <ReviewSummary summary={summary} testID="review-summary" />
    );
    expect(getByTestId("review-summary-dist-5")).toBeTruthy();
    expect(getByTestId("review-summary-dist-1")).toBeTruthy();
  });
});
