import React from "react";
import renderer, { act } from "react-test-renderer";
import { Text, TextInput } from "react-native";
import ReviewSummaryCard from "../components/Reviews/ReviewSummaryCard";
import ReviewList from "../components/Reviews/ReviewList";
import CustomInput from "../components/CustomInput";

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
  };
});

describe("review UI components", () => {
  it("renders summary metrics and distribution rows", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <ReviewSummaryCard
          summary={{
            averageRating: 4.5,
            totalReviewCount: 2,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
          }}
          testID="summary"
        />
      );
    });

    expect(tree.root.findByProps({ testID: "summary-average" }).props.children).toBe(
      "4.5"
    );
    const countText = tree.root.findByProps({ testID: "summary-count" }).props.children;
    expect(Array.isArray(countText) ? countText.join("") : countText).toContain("2 reviews");
    expect(tree.root.findByProps({ testID: "summary-distribution-5" })).toBeTruthy();
  });

  it("shows viewer messaging, verified badges, and removed-review state", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <ReviewList
          reviews={[
            {
              _id: "review-public",
              rating: 5,
              comment: "Excellent quality and quick delivery every time.",
              verifiedPurchase: true,
              user: { _id: "user001", name: "John Doe" },
              createdAt: "2024-02-05T10:00:00.000Z",
              updatedAt: "2024-02-05T10:00:00.000Z",
            },
          ]}
          viewer={{
            reason: "REMOVED_BY_ADMIN",
            review: {
              _id: "review-removed",
              rating: 2,
              comment: "Stored review that was removed by moderation.",
              status: "removed",
              verifiedPurchase: true,
              createdAt: "2024-02-19T11:00:00.000Z",
              updatedAt: "2024-02-20T10:30:00.000Z",
            },
          }}
          testID="reviews"
        />
      );
    });

    expect(
      tree.root.findByProps({ testID: "reviews-viewer-message" }).findByType(Text)
        .props.children
    ).toBe("This review was removed by an administrator.");
    expect(tree.root.findByProps({ testID: "reviews-removed-review" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "reviews-item-0-comment" }).props.children).toBe(
      "Excellent quality and quick delivery every time."
    );
  });

  it("passes multiline input props through CustomInput", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <CustomInput
          value="Review text"
          setValue={() => {}}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="review-input"
        />
      );
    });

    const input = tree.root.findByType(TextInput);
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
    expect(input.props.textAlignVertical).toBe("top");
  });
});
