/* global describe, it, expect */
import React from "react";
import renderer from "react-test-renderer";
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: ({ name, testID }) =>
      React.createElement("Icon", { name, testID }),
  };
});
jest.mock("react-native-progress-dialog", () => "ProgressDialog");
jest.mock("react-native-dropdown-picker", () => "DropDownPicker");
import ReviewList from "../components/ReviewList/ReviewList";
import RatingBreakdown, {
  getBarWidth,
} from "../components/RatingBreakdown/RatingBreakdown";
import { filterReviews, validateReview } from "../utils/reviews";

describe("review ui helpers", () => {
  it("renders a verified-purchase badge and comment", () => {
    let tree;

    renderer.act(() => {
      tree = renderer.create(
        <ReviewList
          review={{
            _id: "review-1",
            rating: 5,
            comment: "Love this product",
            updatedAt: "2024-01-15T00:00:00.000Z",
            user: { _id: "user001", name: "John Doe" },
          }}
          testID="review-card"
        />
      );
    });

    expect(tree.root.findByProps({ testID: "review-card-verified-badge" }).props.children).toBe(
      "Verified Purchase"
    );
    expect(tree.root.findByProps({ testID: "review-card-comment" }).props.children).toBe(
      "Love this product"
    );
  });

  it("computes safe histogram widths", () => {
    expect(getBarWidth(0, 0)).toBe("0%");
    expect(getBarWidth(3, 6)).toBe("50%");

    let tree;

    renderer.act(() => {
      tree = renderer.create(
        <RatingBreakdown
          ratingDistribution={{ 1: 0, 2: 0, 3: 1, 4: 2, 5: 3 }}
          totalReviewCount={6}
          testID="rating-breakdown"
        />
      );
    });

    expect(
      tree.root.findByProps({ testID: "rating-breakdown-bar-5" }).props.style
    ).toEqual(expect.arrayContaining([expect.objectContaining({ width: "50%" })]));
  });

  it("validates review editor input", () => {
    expect(validateReview(0, "hello")).toBe("Select a rating between 1 and 5");
    expect(validateReview(4, "   ")).toBe("Comment is required");
    expect(validateReview(4, "Great purchase")).toBe("");
  });

  it("filters admin reviews by product title, shopper email, or comment", () => {
    const reviews = [
      {
        _id: "review-1",
        product: { title: "Wireless Bluetooth Headphones" },
        user: { email: "user@easybuy.com" },
        comment: "Fantastic audio",
      },
      {
        _id: "review-2",
        product: { title: "Organic Basmati Rice (5kg)" },
        user: { email: "jane@easybuy.com" },
        comment: "Pantry staple",
      },
    ];

    expect(filterReviews(reviews, "headphones")).toHaveLength(1);
    expect(filterReviews(reviews, "jane@easybuy.com")).toHaveLength(1);
    expect(filterReviews(reviews, "pantry")).toHaveLength(1);
  });
});
