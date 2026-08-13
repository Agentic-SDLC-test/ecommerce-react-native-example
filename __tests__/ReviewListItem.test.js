import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewListItem from "../components/ReviewListItem/ReviewListItem";

const baseReview = {
  _id: "review001",
  user: { _id: "user001", name: "John Doe" },
  rating: 5,
  comment: "Great quality.",
  verifiedPurchase: true,
  visible: true,
  updatedAt: "2026-08-13T03:00:00.000Z",
};

describe("ReviewListItem", () => {
  it("renders verified purchase badge for customer view", () => {
    const tree = renderer.create(
      <ReviewListItem review={baseReview} testID="review-item" />
    );
    expect(tree.root.findByProps({ testID: "review-item-verified" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "review-item-comment" }).props.children).toBe(
      "Great quality."
    );
  });

  it("renders admin hide and remove controls", () => {
    const onToggleVisibility = jest.fn();
    const onDelete = jest.fn();
    const tree = renderer.create(
      <ReviewListItem
        review={{ ...baseReview, product: { _id: "prod001", title: "T-Shirt" } }}
        admin
        onToggleVisibility={onToggleVisibility}
        onDelete={onDelete}
        testID="review-item"
      />
    );
    act(() => {
      tree.root.findByProps({ testID: "review-item-hide-btn" }).props.onPress();
      tree.root.findByProps({ testID: "review-item-remove-btn" }).props.onPress();
    });
    expect(onToggleVisibility).toHaveBeenCalledWith("review001", false);
    expect(onDelete).toHaveBeenCalledWith("review001");
  });

  it("shows hidden badge and show action for hidden admin reviews", () => {
    const onToggleVisibility = jest.fn();
    const tree = renderer.create(
      <ReviewListItem
        review={{ ...baseReview, visible: false, product: { _id: "prod001", title: "T-Shirt" } }}
        admin
        onToggleVisibility={onToggleVisibility}
        testID="review-item"
      />
    );
    expect(tree.root.findByProps({ testID: "review-item-hidden" })).toBeTruthy();
    act(() => {
      tree.root.findByProps({ testID: "review-item-show-btn" }).props.onPress();
    });
    expect(onToggleVisibility).toHaveBeenCalledWith("review001", true);
  });
});
