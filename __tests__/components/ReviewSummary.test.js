import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewSummary from "../../components/Reviews/ReviewSummary";

describe("ReviewSummary", () => {
  it("renders empty state when no reviews", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewSummary
          summary={{
            averageRating: 0,
            totalReviews: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            recentReviews: [],
          }}
          testID="review-summary"
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("No reviews yet");
    expect(json).toContain("Be the first verified purchaser");
  });

  it("renders average rating when reviews exist", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewSummary
          summary={{
            averageRating: 4.5,
            totalReviews: 2,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
            recentReviews: [
              {
                _id: "rev001",
                rating: 5,
                body: "Great!",
                user: { _id: "u1", name: "John" },
                verifiedPurchase: true,
                createdAt: "2024-01-20T10:00:00Z",
              },
            ],
          }}
          testID="review-summary"
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("4.5");
    expect(json).toContain("2");
  });
});
