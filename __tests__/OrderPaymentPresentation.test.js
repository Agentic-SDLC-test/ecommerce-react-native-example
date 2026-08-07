import React from "react";
import renderer, { act } from "react-test-renderer";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";
import OrderList from "../components/OrderList/OrderList";
import MyOrderDetailScreen from "../screens/user/MyOrderDetailScreen";
import ViewOrderDetailScreen from "../screens/admin/ViewOrderDetailScreen";

jest.mock("react-native-progress-dialog", () => "ProgressDialog");
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("react-native-step-indicator", () => "StepIndicator");
jest.mock("react-native-dropdown-picker", () => "DropDownPicker");
jest.mock("../utils/session", () => ({
  getUser: jest.fn(() => Promise.resolve({ _id: "user001", token: "token" })),
}));

const sampleOrder = {
  _id: "order001",
  orderId: "ORD-2024-001",
  user: {
    _id: "user001",
    name: "John Doe",
    email: "user@easybuy.com",
  },
  items: [
    {
      productId: {
        _id: "prod001",
        title: "Classic White T-Shirt",
      },
      price: 19.99,
      quantity: 1,
    },
  ],
  amount: 19.99,
  payment_type: "wallet_mock",
  payment_status: "paid",
  status: "shipped",
  country: "Canada",
  city: "Toronto",
  zipcode: "M5V 3A8",
  shippingAddress: "123 Main Street",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  shippedOn: "2024-01-16",
};

describe("order payment presentation", () => {
  it("shows payment details on the confirmation screen", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <OrderConfirmScreen
          navigation={{ replace: jest.fn() }}
          route={{ params: { order: sampleOrder } }}
        />
      );
    });

    expect(
      tree.root.findByProps({ testID: "order-confirm-payment-method" }).props
        .children
    ).toContain("Pay with Wallet (Mock)");
    expect(
      tree.root.findByProps({ testID: "order-confirm-payment-status" }).props
        .children
    ).toContain("Paid");
  });

  it("renders payment metadata in order list rows", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <OrderList item={sampleOrder} onPress={jest.fn()} testID="order-row" />
      );
    });

    expect(
      tree.root.findByProps({ testID: "order-row-payment" }).props.children.join(
        ""
      )
    ).toContain("Payment: Pay with Wallet (Mock) - Paid");
  });

  it("keeps shipping status separate from payment status in shopper detail", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <MyOrderDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{ params: { orderDetail: sampleOrder } }}
        />
      );
    });

    expect(
      tree.root.findByProps({ testID: "my-order-detail-package-status" }).props
        .children
    ).toBe("shipped");
    expect(
      tree.root.findByProps({ testID: "my-order-detail-payment-status" }).props
        .children
    ).toContain("Paid");
  });

  it("shows payment details without changing the admin shipping control", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ViewOrderDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{ params: { orderDetail: sampleOrder } }}
        />
      );
    });

    expect(
      tree.root.findByProps({ testID: "view-order-detail-payment-method" }).props
        .children
    ).toContain("Pay with Wallet (Mock)");
    expect(
      tree.root.findByProps({ testID: "view-order-detail-status-dropdown" })
    ).toBeTruthy();
  });
});
