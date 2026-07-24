import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";
import ProductDetailScreen from "../screens/user/ProductDetailScreen";

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
  };
});

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn((selector) => selector({ product: [] })),
}));

jest.mock("redux", () => ({
  bindActionCreators: jest.fn(() => ({
    addCartItem: jest.fn(),
  })),
}));

jest.mock("../api", () => ({
  getWishlist: jest.fn(),
  getProductReviews: jest.fn(),
  createReview: jest.fn(),
  updateReview: jest.fn(),
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
}));

const api = require("../api");

describe("ProductDetailScreen reviews", () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const route = {
    params: {
      product: {
        _id: "prod001",
        title: "Classic White T-Shirt",
        price: 19.99,
        quantity: 10,
        description: "A comfortable everyday white t-shirt made from 100% cotton.",
        image: "tshirt.png",
      },
    },
  };

  beforeEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_REVIEWS = "true";
    jest.clearAllMocks();
    api.getWishlist.mockResolvedValue({ success: true, data: [{ wishlist: [] }] });
  });

  it("renders the anonymous eligibility message", async () => {
    api.getProductReviews.mockResolvedValue({
      success: true,
      data: {
        summary: {
          averageRating: 0,
          totalReviewCount: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        recentReviews: [],
        viewer: {
          canReview: false,
          canEdit: false,
          reason: "LOGIN_REQUIRED",
          eligibleOrderId: null,
          review: null,
        },
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ProductDetailScreen navigation={navigation} route={route} />
      );
    });

    const message = tree.root.findByProps({
      testID: "product-detail-review-list-viewer-message",
    });
    expect(message.findByType(Text).props.children).toBe(
      "Log in to review after purchase."
    );
  });

  it("prefills edit mode for existing reviews", async () => {
    api.getProductReviews.mockResolvedValue({
      success: true,
      data: {
        summary: {
          averageRating: 4.5,
          totalReviewCount: 2,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
        },
        recentReviews: [],
        viewer: {
          canReview: false,
          canEdit: true,
          reason: "REVIEW_EXISTS",
          eligibleOrderId: "order004",
          review: {
            _id: "review001",
            rating: 5,
            comment: "Great shirt quality and the fit stayed true after washing.",
            status: "published",
          },
        },
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ProductDetailScreen navigation={navigation} route={route} />
      );
    });

    await act(async () => {
      tree.root
        .findByProps({ testID: "product-detail-review-edit-link" })
        .props.onPress();
    });

    const buttonText = tree.root.findByProps({
      testID: "product-detail-review-submit-btn-text",
    });
    expect(buttonText.props.children).toBe("Update review");
  });

  it("keeps add-to-cart available when review loading fails", async () => {
    api.getProductReviews.mockRejectedValue(new Error("Review service unavailable"));

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ProductDetailScreen navigation={navigation} route={route} />
      );
    });

    expect(tree.root.findByProps({ testID: "product-detail-add-to-cart-btn" })).toBeTruthy();
    expect(
      tree.root.findByProps({ testID: "product-detail-alert-message" }).props.children
    ).toBe("Review service unavailable");
  });
});
