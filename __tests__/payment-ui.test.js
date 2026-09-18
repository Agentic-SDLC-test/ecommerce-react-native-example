import React from "react";
import renderer, { act } from "react-test-renderer";
import { Text } from "react-native";
import OrderList from "../components/OrderList/OrderList";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";

jest.mock("../utils/session", () => ({
  getUser: jest.fn(() => Promise.resolve({ name: "Test User" })),
}));

jest.mock("../components/CustomButton", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockCustomButton({ text, testID, onPress }) {
    return <Text testID={testID} onPress={onPress}>{text}</Text>;
  };
});

const order = {
  orderId: "ORD-1",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  items: [{ price: 10, quantity: 2 }],
  status: "pending",
  payment_type: "mock_wallet",
  payment_status: "paid",
};

const textByTestID = (tree, testID) =>
  tree.root.findByProps({ testID }).findByType(Text).props.children;

describe("payment UI", () => {
  it("renders fulfillment and payment state separately in order rows", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<OrderList item={order} testID="order-row" onPress={jest.fn()} />);
    });

    expect(textByTestID(tree, "order-row-status")).toEqual(["Fulfillment: ", "pending"]);
    expect(textByTestID(tree, "order-row-payment-method")).toEqual([
      "Payment: ",
      "Mock Wallet",
    ]);
    expect(textByTestID(tree, "order-row-payment-status")).toBe("Paid");
  });

  it("renders confirmation payment details from route order data", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <OrderConfirmScreen
          navigation={{ replace: jest.fn() }}
          route={{ params: { order } }}
        />
      );
    });

    expect(textByTestID(tree, "order-confirm-payment-method")).toEqual([
      "Payment Method: ",
      "Mock Wallet",
    ]);
    expect(textByTestID(tree, "order-confirm-payment-status")).toEqual([
      "Payment Status: ",
      "Paid",
    ]);
    expect(textByTestID(tree, "order-confirm-payment-description")).toContain(
      "no further payment action"
    );
  });
});
