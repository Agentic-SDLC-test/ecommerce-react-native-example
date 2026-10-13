import React from "react";
import { render } from "@testing-library/react-native";
import ReviewSection from "../components/ReviewSection";

const emptySummary = { average: null, count: 0, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } };

const filledSummary = {
  average: 4.3,
  count: 3,
  distribution: { "1": 0, "2": 0, "3": 0, "4": 2, "5": 1 },
};

const sampleReviews = [
  {
    _id: "r1",
    rating: 5,
    comment: "Excellent",
    reviewerName: "John D.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    edited: false,
  },
  {
    _id: "r2",
    rating: 4,
    comment: "Good",
    reviewerName: "Jane S.",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    edited: false,
  },
];

describe("ReviewSection", () => {
  it("shows the empty state and no average when there are no ratings", () => {
    const { getByTestId, queryByTestId } = render(
      <ReviewSection summary={emptySummary} reviews={[]} myReview={null} loadError={false} onWritePress={() => {}} />
    );
    expect(getByTestId("review-section-empty")).toBeTruthy();
    expect(queryByTestId("review-section-average")).toBeNull();
  });

  it("shows the average, distribution counts, and a Verified Purchase badge per review", () => {
    const { getByTestId, getAllByText } = render(
      <ReviewSection
        summary={filledSummary}
        reviews={sampleReviews}
        myReview={null}
        loadError={false}
        onWritePress={() => {}}
      />
    );
    expect(getByTestId("review-section-average").props.children).toBe("4.3");
    expect(getByTestId("review-section-dist-5")).toBeTruthy();
    expect(getByTestId("review-section-dist-4")).toBeTruthy();
    expect(getAllByText("Verified Purchase")).toHaveLength(2);
  });

  it("shows Write a review for an eligible customer with no review yet", () => {
    const { getByText } = render(
      <ReviewSection
        summary={filledSummary}
        reviews={sampleReviews}
        myReview={{ eligible: true, review: null }}
        loadError={false}
        onWritePress={() => {}}
      />
    );
    expect(getByText("Write a review")).toBeTruthy();
  });

  it("shows Edit your review when the customer already has one", () => {
    const { getByText } = render(
      <ReviewSection
        summary={filledSummary}
        reviews={sampleReviews}
        myReview={{ eligible: true, review: { rating: 5, comment: "", isVisible: true } }}
        loadError={false}
        onWritePress={() => {}}
      />
    );
    expect(getByText("Edit your review")).toBeTruthy();
  });

  it("shows the ineligible message for a signed-in customer without a delivered order", () => {
    const { getByTestId } = render(
      <ReviewSection
        summary={filledSummary}
        reviews={sampleReviews}
        myReview={{ eligible: false, review: null }}
        loadError={false}
        onWritePress={() => {}}
      />
    );
    expect(getByTestId("review-section-ineligible")).toBeTruthy();
  });

  it("shows the load-error message instead of the summary", () => {
    const { getByTestId, queryByTestId } = render(
      <ReviewSection summary={null} reviews={[]} myReview={null} loadError={true} onWritePress={() => {}} />
    );
    expect(getByTestId("review-section-error")).toBeTruthy();
    expect(queryByTestId("review-section-empty")).toBeNull();
  });
});
