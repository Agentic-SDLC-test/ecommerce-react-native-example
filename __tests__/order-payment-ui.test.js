import React from "react";
import renderer, { act } from "react-test-renderer";
import { Text } from "react-native";
import CheckoutScreen from "../screens/user/CheckoutScreen";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";
import OrderList from "../components/OrderList/OrderList";
import MyOrderDetailScreen from "../screens/user/MyOrderDetailScreen";
import ViewOrderDetailScreen from "../screens/admin/ViewOrderDetailScreen";

const mockCheckout = jest.fn();
const mockUpdateOrderPaymentStatus = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockEmptyCart = jest.fn();
let mockCart = [];

jest.mock("react-native-progress-dialog", () => () => null);
jest.mock("react-native-step-indicator", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ testID, labels }) => (
    <View testID={testID}>
      <Text>{labels.join(",")}</Text>
    </View>
  );
});
jest.mock("react-native-dropdown-picker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return (props) => (
    <View {...props} testID={props.testID}>
      <Text>{props.value}</Text>
    </View>
  );
});
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
  };
});
jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ product: mockCart }),
  useDispatch: () => jest.fn(),
}));
jest.mock("redux", () => ({
  bindActionCreators: () => ({
    emptyCart: mockEmptyCart,
  }),
}));
jest.mock("../api", () => ({
  checkout: (...args) => mockCheckout(...args),
  updateOrderPaymentStatus: (...args) => mockUpdateOrderPaymentStatus(...args),
  updateOrderStatus: (...args) => mockUpdateOrderStatus(...args),
}));
jest.mock("../utils/session", () => ({
  getUser: jest.fn().mockResolvedValue({ _id: "user001", name: "John Doe" }),
}));

const sampleCardOrder = {
  _id: "order-card-001",
  orderId: "ORD-2026-001",
  payment_type: "card",
  payment_status: "awaiting_payment",
  status: "pending",
  country: "Canada",
  city: "Toronto",
  zipcode: "M5V 3A8",
  shippingAddress: "123 Main Street",
  createdAt: "2026-07-24T12:00:00.000Z",
  updatedAt: "2026-07-25T12:00:00.000Z",
  items: [
    {
      productId: { _id: "prod001", title: "Classic White T-Shirt" },
      price: 19.99,
      quantity: 2,
    },
  ],
  user: { _id: "user001", name: "John Doe", email: "user@easybuy.com" },
};

function findInput(tree, testID) {
  return tree.root
    .findAllByProps({ testID })
    .find((node) => typeof node.props.onChangeText === "function");
}

describe("order payment UI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCart = [
      { _id: "prod001", title: "Classic White T-Shirt", price: 19.99, quantity: 2 },
    ];
    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER = "true";
  });

  it("submits checkout with the selected card demo payment type", async () => {
    mockCheckout.mockResolvedValue({
      success: true,
      data: sampleCardOrder,
    });

    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;

    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });

    await act(async () => {
      tree.root.findByProps({ testID: "checkout-address-btn" }).props.onPress();
    });
    await act(async () => {
      findInput(tree, "checkout-country-input").props.onChangeText("Canada");
      findInput(tree, "checkout-city-input").props.onChangeText("Toronto");
      findInput(tree, "checkout-street-input").props.onChangeText("123 Main Street");
      findInput(tree, "checkout-zipcode-input").props.onChangeText("M5V 3A8");
    });
    await act(async () => {
      tree.root.findByProps({ testID: "checkout-save-address-btn" }).props.onPress();
    });
    await act(async () => {
      tree.root.findByProps({ testID: "checkout-payment-option-card" }).props.onPress();
    });
    await act(async () => {
      tree.root.findByProps({ testID: "checkout-submit-btn" }).props.onPress();
    });

    expect(mockCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_type: "card",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
      })
    );
    expect(mockEmptyCart).toHaveBeenCalledWith("empty");
    expect(navigation.replace).toHaveBeenCalledWith("orderconfirm", {
      order: sampleCardOrder,
    });
  });

  it("hides the card demo option when the feature flag is off", async () => {
    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER = "false";

    let tree;
    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={{ goBack: jest.fn(), replace: jest.fn() }} />);
    });

    expect(tree.root.findAllByProps({ testID: "checkout-payment-option-card" })).toHaveLength(0);
  });

  it("resolves payment state from order confirmation", async () => {
    mockUpdateOrderPaymentStatus.mockResolvedValue({
      success: true,
      data: {
        ...sampleCardOrder,
        payment_status: "paid",
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <OrderConfirmScreen
          navigation={{ replace: jest.fn() }}
          route={{ params: { order: sampleCardOrder } }}
        />
      );
    });

    await act(async () => {
      tree.root.findByProps({ testID: "order-confirm-mark-paid-btn" }).props.onPress();
    });

    expect(mockUpdateOrderPaymentStatus).toHaveBeenCalledWith("order-card-001", {
      payment_status: "paid",
    });
    expect(tree.root.findByProps({ testID: "order-confirm-payment-status" }).props.children).toBe(
      "Paid"
    );
    expect(
      tree.root.findByProps({ testID: "order-confirm-payment-disclaimer" }).props.children
    ).toBe("Demo payment only - no real card charge was made.");
  });

  it("renders order list payment and delivery rows for shared order history cards", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <OrderList item={sampleCardOrder} onPress={jest.fn()} testID="order-list-card" />
      );
    });

    expect(
      tree.root.findByProps({ testID: "order-list-card-delivery-status" }).props.children
    ).toBe("Pending");
    expect(
      tree.root.findByProps({ testID: "order-list-card-payment-status" }).props.children
    ).toBe("Awaiting payment");
  });

  it("shows payment information in shopper order detail", async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(
        <MyOrderDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{ params: { orderDetail: sampleCardOrder } }}
        />
      );
    });

    expect(tree.root.findByProps({ testID: "my-order-detail-payment-method" }).props.children).toBe(
      "Card demo"
    );
    expect(tree.root.findByProps({ testID: "my-order-detail-payment-status" }).props.children).toBe(
      "Awaiting payment"
    );
    expect(
      tree.root.findByProps({ testID: "my-order-detail-payment-disclaimer" }).props.children
    ).toBe("Demo payment only - no real card charge was made.");
  });

  it("shows read-only payment context while keeping admin delivery updates separate", async () => {
    mockUpdateOrderStatus.mockResolvedValue({
      success: true,
      data: {
        ...sampleCardOrder,
        status: "shipped",
      },
    });

    let tree;
    await act(async () => {
      tree = renderer.create(
        <ViewOrderDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{ params: { orderDetail: sampleCardOrder } }}
        />
      );
    });

    const dropdown = tree.root.findByProps({
      testID: "view-order-detail-status-dropdown",
    });

    await act(async () => {
      dropdown.props.setValue("shipped");
    });
    await act(async () => {
      tree.root.findByProps({ testID: "view-order-detail-update-btn" }).props.onPress();
    });

    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("order-card-001", "shipped");
    expect(tree.root.findByProps({ testID: "view-order-detail-payment-method" }).props.children).toBe(
      "Card demo"
    );
    expect(tree.root.findByProps({ testID: "view-order-detail-payment-status" }).props.children).toBe(
      "Awaiting payment"
    );
  });
});
