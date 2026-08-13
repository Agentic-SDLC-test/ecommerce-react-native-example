import React from "react";
import renderer from "react-test-renderer";
import StarRatingDisplay from "../components/Reviews/StarRatingDisplay";
import RatingDistribution from "../components/Reviews/RatingDistribution";
import ReviewCard from "../components/Reviews/ReviewCard";
import ProductReviewSummary from "../components/Reviews/ProductReviewSummary";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, testID }) => <Text testID={testID}>{name}</Text>,
  };
});

describe("StarRatingDisplay", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<StarRatingDisplay rating={4} testID="stars" />);
    expect(tree).toBeTruthy();
  });
});

describe("RatingDistribution", () => {
  it("renders distribution rows", () => {
    const tree = renderer.create(
      <RatingDistribution
        distribution={{ 1: 0, 2: 0, 3: 1, 4: 2, 5: 3 }}
        totalCount={6}
        testID="dist"
      />
    );
    expect(tree).toBeTruthy();
  });
});

describe("ReviewCard", () => {
  const review = {
    _id: "r1",
    user: { name: "John Doe" },
    rating: 5,
    body: "Great product",
    verifiedPurchase: true,
    createdAt: "2026-08-13T13:00:00.000Z",
  };

  it("renders reviewer name and verified purchase indicator", () => {
    const tree = renderer.create(<ReviewCard review={review} testID="card" />);
    const json = tree.toJSON();
    const textNodes = JSON.stringify(json);
    expect(textNodes).toContain("John Doe");
    expect(textNodes).toContain("Verified Purchase");
  });
});

describe("ProductReviewSummary", () => {
  it("shows empty state when no reviews", () => {
    const tree = renderer.create(
      <ProductReviewSummary
        summary={{ averageRating: 0, totalCount: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }}
        reviews={[]}
        onWriteReview={() => {}}
        eligibility={{ eligible: true, existingReview: null }}
        testID="summary"
      />
    );
    const textNodes = JSON.stringify(tree.toJSON());
    expect(textNodes).toContain("No reviews yet");
    expect(textNodes).toContain("Write a Review");
  });

  it("shows average rating with reviews", () => {
    const tree = renderer.create(
      <ProductReviewSummary
        summary={{
          averageRating: 4.5,
          totalCount: 2,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
        }}
        reviews={[
          {
            _id: "r1",
            user: { name: "John" },
            rating: 5,
            body: "Great",
            verifiedPurchase: true,
            createdAt: "2026-08-13T13:00:00.000Z",
          },
        ]}
        onWriteReview={() => {}}
        eligibility={null}
        testID="summary"
      />
    );
    const textNodes = JSON.stringify(tree.toJSON());
    expect(textNodes).toContain("4.5");
    expect(textNodes).toContain("reviews");
  });
});
