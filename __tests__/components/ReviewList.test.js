import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewList from "../../components/Reviews/ReviewList";

describe("ReviewList", () => {
  it("renders verified purchase badge", () => {
    const reviews = [
      {
        _id: "rev001",
        rating: 4,
        body: "Good product",
        user: { _id: "u1", name: "Jane Doe" },
        verifiedPurchase: true,
        createdAt: "2024-01-20T10:00:00Z",
      },
    ];
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewList reviews={reviews} testID="review-list" />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("Verified Purchase");
    expect(json).toContain("Jane Doe");
  });

  it("returns null for empty reviews", () => {
    let tree;
    act(() => {
      tree = renderer.create(<ReviewList reviews={[]} testID="review-list" />);
    });
    expect(tree.toJSON()).toBeNull();
  });
});
