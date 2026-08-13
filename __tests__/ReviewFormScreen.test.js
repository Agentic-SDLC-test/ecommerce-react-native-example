import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewFormScreen from "../screens/user/ReviewFormScreen";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
  };
});

jest.mock("react-native-progress-dialog", () => {
  const { View } = require("react-native");
  return ({ visible }) => (visible ? <View testID="progress-dialog" /> : null);
});

jest.mock("../api", () => ({
  getMyProductReview: jest.fn(),
  upsertProductReview: jest.fn(),
}));

import * as api from "../api";

const mockNavigation = {
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

const mockRoute = {
  params: {
    productId: "prod007",
    productTitle: "Organic Basmati Rice (5kg)",
  },
};

describe("ReviewFormScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows ineligible state when user cannot review", async () => {
    api.getMyProductReview.mockResolvedValue({
      success: true,
      data: {
        eligible: false,
        reason: "Only delivered purchases can be reviewed",
        existingReview: null,
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ReviewFormScreen navigation={mockNavigation} route={mockRoute} />
      );
      await Promise.resolve();
    });

    const textNodes = JSON.stringify(tree.toJSON());
    expect(textNodes).toContain("Only delivered purchases can be reviewed");
    expect(api.upsertProductReview).not.toHaveBeenCalled();
  });

  it("prefills fields when existing review is returned", async () => {
    api.getMyProductReview.mockResolvedValue({
      success: true,
      data: {
        eligible: true,
        reason: "Delivered purchase found",
        existingReview: {
          _id: "review001",
          rating: 4,
          body: "Previously written review",
        },
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ReviewFormScreen navigation={mockNavigation} route={mockRoute} />
      );
      await Promise.resolve();
    });

    const textNodes = JSON.stringify(tree.toJSON());
    expect(textNodes).toContain("Previously written review");
    expect(textNodes).toContain("Edit Your Review");
  });
});
