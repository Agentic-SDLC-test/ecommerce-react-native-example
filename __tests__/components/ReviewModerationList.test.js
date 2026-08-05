import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewModerationList from "../../components/Reviews/ReviewModerationList";

const sampleReview = {
  _id: "rev001",
  productId: "prod001",
  product: { _id: "prod001", title: "Test Product" },
  user: { _id: "u1", name: "John", email: "john@test.com" },
  rating: 5,
  body: "Great product",
  visible: true,
  removed: false,
  moderationStatus: "visible",
};

describe("ReviewModerationList", () => {
  it("renders visible status", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewModerationList
          item={sampleReview}
          onToggleVisibility={jest.fn()}
          onRemove={jest.fn()}
          testID="mod-item"
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("Visible");
    expect(json).toContain("Test Product");
  });

  it("renders removed status", () => {
    const removedReview = {
      ...sampleReview,
      visible: false,
      removed: true,
      moderationStatus: "removed",
      removedAt: "2024-01-23T11:00:00Z",
    };
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewModerationList
          item={removedReview}
          onToggleVisibility={jest.fn()}
          onRemove={jest.fn()}
          testID="mod-item"
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("Removed");
  });
});
