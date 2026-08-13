import React from "react";
import { render } from "@testing-library/react-native";
import ReviewCard from "../components/Reviews/ReviewCard";

describe("ReviewCard", () => {
  const review = {
    _id: "review001",
    productId: "prod007",
    user: { _id: "user001", name: "John Doe" },
    rating: 5,
    comment: "Great fit and comfortable fabric.",
    verifiedPurchase: true,
    createdAt: "2024-01-20T10:00:00.000Z",
    updatedAt: "2024-01-20T10:00:00.000Z",
  };

  it("renders reviewer name, comment, and verified purchase label", () => {
    const { getByTestId } = render(
      <ReviewCard review={review} testID="review-card" />
    );
    expect(getByTestId("review-card-name").props.children).toBe("John Doe");
    expect(getByTestId("review-card-comment").props.children).toBe(
      "Great fit and comfortable fabric."
    );
    expect(getByTestId("review-card-verified").props.children).toBe(
      "Verified Purchase"
    );
  });

  it("does not show verified label when not a verified purchase", () => {
    const unverified = { ...review, verifiedPurchase: false };
    const { queryByTestId } = render(
      <ReviewCard review={unverified} testID="review-card" />
    );
    expect(queryByTestId("review-card-verified")).toBeNull();
  });
});
