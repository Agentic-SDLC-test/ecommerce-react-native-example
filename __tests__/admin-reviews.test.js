import React from "react";
import renderer, { act } from "react-test-renderer";
import { Text, View } from "react-native";
import DashboardScreen from "../screens/admin/DashboardScreen";
import ViewReviewsScreen from "../screens/admin/ViewReviewsScreen";
import ViewReviewDetailScreen from "../screens/admin/ViewReviewDetailScreen";

jest.mock("react-native-progress-dialog", () => () => null);
jest.mock("react-native-dropdown-picker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return (props) => (
    <View {...props} testID={props.testID}>
      <Text>{props.value}</Text>
    </View>
  );
});
jest.mock("../components/ConnectionAlert/ConnectionAlert", () => (props) => props.children);
jest.mock("../utils/session", () => ({
  clearSession: jest.fn(),
}));
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }) => <Text>{name}</Text>,
  };
});

jest.mock("../api", () => ({
  getDashboard: jest.fn(),
  getAdminReviews: jest.fn(),
  updateReviewStatus: jest.fn(),
}));

const api = require("../api");

describe("admin review moderation screens", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_REVIEWS = "true";
    jest.clearAllMocks();
  });

  it("shows the review dashboard action when the feature flag is enabled", async () => {
    api.getDashboard.mockResolvedValue({
      success: true,
      data: {
        usersCount: 2,
        ordersCount: 6,
        productsCount: 8,
        categoriesCount: 4,
        reviewsCount: 4,
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <DashboardScreen
          navigation={{ navigate: jest.fn(), replace: jest.fn() }}
          route={{ params: { authUser: { _id: "admin001" } } }}
        />
      );
    });

    expect(tree.root.findByProps({ testID: "dashboard-reviews-option" })).toBeTruthy();
  });

  it("loads, filters, and navigates from the review list", async () => {
    api.getAdminReviews.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "review001",
          productTitle: "Classic White T-Shirt",
          userName: "John Doe",
          orderId: "ORD-2024-004",
          status: "published",
          comment: "Great shirt quality and the fit stayed true after washing.",
        },
        {
          _id: "review003",
          productTitle: "Organic Basmati Rice (5kg)",
          userName: "John Doe",
          orderId: "ORD-2024-003",
          status: "hidden",
          comment: "Rice arrived fresh and cooks well, but the bag tore on arrival.",
        },
      ],
    });

    const navigate = jest.fn();
    let tree;
    await act(async () => {
      tree = renderer.create(
        <ViewReviewsScreen
          navigation={{ goBack: jest.fn(), navigate }}
          route={{ params: { authUser: { _id: "admin001" } } }}
        />
      );
    });

    await act(async () => {
      tree.root
        .findAllByProps({ testID: "view-reviews-search-input" })
        .find((node) => typeof node.props.onChangeText === "function")
        .props.onChangeText("hidden");
    });

    await act(async () => {
      tree.root.findByProps({ testID: "view-reviews-item-0" }).props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith(
      "viewreviewdetails",
      expect.objectContaining({
        reviewDetail: expect.objectContaining({ _id: "review003" }),
      })
    );
  });

  it("updates moderation status and disables removed reviews", async () => {
    api.updateReviewStatus.mockResolvedValue({
      success: true,
      data: {
        _id: "review001",
        status: "hidden",
        productTitle: "Classic White T-Shirt",
        userName: "John Doe",
        orderId: "ORD-2024-004",
        rating: 5,
        comment: "Great shirt quality and the fit stayed true after washing.",
        verifiedPurchase: true,
        createdAt: "2024-02-05T10:00:00.000Z",
        updatedAt: "2024-02-21T10:30:00.000Z",
        moderatedAt: "2024-02-21T10:30:00.000Z",
        moderatedBy: "admin001",
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ViewReviewDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{
            params: {
              reviewDetail: {
                _id: "review001",
                status: "published",
                productTitle: "Classic White T-Shirt",
                userName: "John Doe",
                orderId: "ORD-2024-004",
                rating: 5,
                comment: "Great shirt quality and the fit stayed true after washing.",
                verifiedPurchase: true,
                createdAt: "2024-02-05T10:00:00.000Z",
                updatedAt: "2024-02-05T10:00:00.000Z",
              },
            },
          }}
        />
      );
    });

    const dropdown = tree.root.findByProps({
      testID: "view-review-detail-status-dropdown",
    });

    await act(async () => {
      dropdown.props.setValue("hidden");
    });

    await act(async () => {
      tree.root
        .findByProps({ testID: "view-review-detail-update-btn" })
        .props.onPress();
    });

    expect(api.updateReviewStatus).toHaveBeenCalledWith("review001", "hidden");
    expect(
      tree.root.findByProps({ testID: "view-review-detail-alert-message" }).props.children
    ).toBe("Review status updated to hidden");

    await act(async () => {
      tree.update(
        <ViewReviewDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{
            params: {
              reviewDetail: {
                _id: "review004",
                status: "removed",
                productTitle: "Face Moisturizer SPF 30",
                userName: "Jane Smith",
                orderId: "ORD-2024-006",
                rating: 2,
                comment: "Moisturizer felt heavy for my skin, so I stopped using it.",
                verifiedPurchase: true,
                createdAt: "2024-02-19T11:00:00.000Z",
                updatedAt: "2024-02-20T10:30:00.000Z",
                moderatedAt: "2024-02-20T10:30:00.000Z",
                moderatedBy: "admin001",
              },
            },
          }}
        />
      );
    });

    expect(
      tree.root.findByProps({ testID: "view-review-detail-update-btn" }).props.disabled
    ).toBe(true);
  });
});
