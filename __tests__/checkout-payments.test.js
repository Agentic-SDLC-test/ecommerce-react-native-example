import React from "react";
import renderer, { act } from "react-test-renderer";

jest.mock("react-native-progress-dialog", () => () => null);
jest.mock("react-native-step-indicator", () => () => null);
jest.mock("react-native-dropdown-picker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return (props) => (
    <View {...props} testID={props.testID}>
      <Text>{props.value}</Text>
    </View>
  );
});
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockModal = ({ children, visible, testID, onRequestClose }) =>
    visible ? (
      <View testID={testID} onRequestClose={onRequestClose}>
        {children}
      </View>
    ) : null;

  return {
    __esModule: true,
    default: MockModal,
  };
});
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
  };
});

let mockCartItems = [];
let mockEmptyCart;

jest.mock("react-redux", () => ({
  useSelector: jest.fn((selector) => selector({ product: mockCartItems })),
  useDispatch: jest.fn(() => jest.fn()),
}));
jest.mock("redux", () => ({
  bindActionCreators: () => ({
    emptyCart: (...args) => mockEmptyCart(...args),
  }),
}));
jest.mock("../api", () => ({
  checkout: jest.fn(),
  updateOrderPayment: jest.fn(),
  updateOrderStatus: jest.fn(),
}));
jest.mock("../utils/session", () => ({
  getUser: jest.fn(),
}));

import * as api from "../api";
import { getUser } from "../utils/session";
import CheckoutScreen from "../screens/user/CheckoutScreen";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";
import OrderList from "../components/OrderList/OrderList";
import MyOrderDetailScreen from "../screens/user/MyOrderDetailScreen";
import ViewOrderDetailScreen from "../screens/admin/ViewOrderDetailScreen";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusMessage,
} from "../utils/payments";
import { isWalletPaymentsEnabled } from "../utils/features";

const baseOrder = {
  _id: "order-wallet-1",
  orderId: "ORD-2026-1001",
  user: { _id: "user001", name: "John Doe", email: "user@easybuy.com" },
  items: [{ productId: { _id: "prod001", title: "Classic White T-Shirt" }, price: 19.99, quantity: 2 }],
  amount: 39.98,
  discount: 0,
  payment_type: "wallet_mock",
  payment_status: "pending",
  payment_status_updated_at: "2026-07-24T23:57:27.414Z",
  payment_failure_reason: null,
  country: "Canada",
  city: "Toronto",
  zipcode: "M5V 3A8",
  shippingAddress: "123 Main Street",
  status: "pending",
  createdAt: "2026-07-24T23:57:27.414Z",
  updatedAt: "2026-07-24T23:57:27.414Z",
};

function toText(value) {
  return Array.isArray(value) ? value.join("") : String(value);
}

async function fillAddress(tree) {
  const findInput = (testID) =>
    tree.root
      .findAllByProps({ testID })
      .find((node) => typeof node.props.onChangeText === "function");

  await act(async () => {
    tree.root.findByProps({ testID: "checkout-address-btn" }).props.onPress();
  });
  await act(async () => {
    findInput("checkout-country-input").props.onChangeText("Canada");
    findInput("checkout-city-input").props.onChangeText("Toronto");
    findInput("checkout-street-input").props.onChangeText("123 Main Street");
    findInput("checkout-zipcode-input").props.onChangeText("M5V 3A8");
  });
  await act(async () => {
    tree.root.findByProps({ testID: "checkout-save-address-btn" }).props.onPress();
  });
}

async function submitWalletOrder(tree) {
  await act(async () => {
    tree.root.findByProps({ testID: "checkout-payment-wallet" }).props.onPress();
  });
  await act(async () => {
    tree.root.findByProps({ testID: "checkout-submit-btn" }).props.onPress();
  });
}

describe("checkout payment flows and payment-aware surfaces", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    process.env.EXPO_PUBLIC_ENABLE_WALLET_PAYMENTS = "true";
    mockCartItems = [
      {
        _id: "prod001",
        title: "Classic White T-Shirt",
        price: 19.99,
        quantity: 2,
      },
    ];
    mockEmptyCart = jest.fn();
    getUser.mockResolvedValue({ _id: "user001", token: "mock-user-token-001" });
  });

  it("evaluates wallet feature flags and payment helper copy", () => {
    expect(isWalletPaymentsEnabled()).toBe(true);
    expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    expect(getPaymentStatusLabel("failed")).toBe("Payment failed");
    expect(
      getPaymentStatusMessage({
        payment_type: "wallet_mock",
        payment_status: "failed",
        payment_failure_reason: "timeout",
      }).detail
    ).toContain("timed out");
  });

  it("submits COD orders immediately and clears the cart after success", async () => {
    api.checkout.mockResolvedValue({
      success: true,
      data: {
        ...baseOrder,
        payment_type: "cod",
        orderId: "ORD-2026-2001",
      },
    });

    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });

    await fillAddress(tree);

    await act(async () => {
      tree.root.findByProps({ testID: "checkout-submit-btn" }).props.onPress();
    });

    expect(api.checkout).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_type: "cod",
      })
    );
    expect(mockEmptyCart).toHaveBeenCalledWith("empty");
    expect(navigation.replace).toHaveBeenCalledWith(
      "orderconfirm",
      expect.objectContaining({
        order: expect.objectContaining({ payment_type: "cod" }),
      })
    );
  });

  it("keeps the cart until wallet payment is confirmed", async () => {
    api.checkout.mockResolvedValue({
      success: true,
      data: baseOrder,
    });
    api.updateOrderPayment.mockResolvedValue({
      success: true,
      data: {
        ...baseOrder,
        payment_status: "paid",
      },
    });

    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });

    await fillAddress(tree);
    await submitWalletOrder(tree);

    expect(mockEmptyCart).not.toHaveBeenCalled();

    await act(async () => {
      tree.root.findByProps({ testID: "checkout-wallet-confirm-btn" }).props.onPress();
    });

    expect(api.updateOrderPayment).toHaveBeenCalledWith(baseOrder._id, {
      payment_status: "paid",
    });
    expect(mockEmptyCart).toHaveBeenCalledWith("empty");
    expect(navigation.replace).toHaveBeenCalledWith(
      "orderconfirm",
      expect.objectContaining({
        order: expect.objectContaining({ payment_status: "paid" }),
      })
    );
  });

  it("records declined wallet outcomes", async () => {
    api.checkout.mockResolvedValue({ success: true, data: baseOrder });
    api.updateOrderPayment.mockResolvedValue({
      success: true,
      data: {
        ...baseOrder,
        payment_status: "failed",
        payment_failure_reason: "declined",
      },
    });

    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });

    await fillAddress(tree);
    await submitWalletOrder(tree);
    await act(async () => {
      tree.root.findByProps({ testID: "checkout-wallet-decline-btn" }).props.onPress();
    });

    expect(api.updateOrderPayment).toHaveBeenCalledWith(baseOrder._id, {
      payment_status: "failed",
      payment_failure_reason: "declined",
    });
  });

  it("records cancelled wallet outcomes when the modal is closed", async () => {
    api.checkout.mockResolvedValue({ success: true, data: baseOrder });
    api.updateOrderPayment.mockResolvedValue({
      success: true,
      data: {
        ...baseOrder,
        payment_status: "failed",
        payment_failure_reason: "cancelled",
      },
    });

    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });

    await fillAddress(tree);
    await submitWalletOrder(tree);
    await act(async () => {
      tree.root.findByProps({ testID: "checkout-wallet-modal" }).props.onRequestClose();
    });

    expect(api.updateOrderPayment).toHaveBeenCalledWith(baseOrder._id, {
      payment_status: "failed",
      payment_failure_reason: "cancelled",
    });
  });

  it("records timeout wallet outcomes after 60 seconds", async () => {
    jest.useFakeTimers();
    api.checkout.mockResolvedValue({ success: true, data: baseOrder });
    api.updateOrderPayment.mockResolvedValue({
      success: true,
      data: {
        ...baseOrder,
        payment_status: "failed",
        payment_failure_reason: "timeout",
      },
    });

    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });

    await fillAddress(tree);
    await submitWalletOrder(tree);
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(api.updateOrderPayment).toHaveBeenCalledWith(baseOrder._id, {
      payment_status: "failed",
      payment_failure_reason: "timeout",
    });
  });

  it("renders payment summaries across confirmation, order list, shopper detail, and admin detail", async () => {
    let confirmTree;
    await act(async () => {
      confirmTree = renderer.create(
        <OrderConfirmScreen
          navigation={{ replace: jest.fn() }}
          route={{ params: { order: { ...baseOrder, payment_status: "failed", payment_failure_reason: "declined" } } }}
        />
      );
    });
    expect(
      toText(confirmTree.root.findByProps({ testID: "order-confirm-payment-status" }).props.children)
    ).toContain("Payment failed");

    let listTree;
    await act(async () => {
      listTree = renderer.create(
        <OrderList
          item={{ ...baseOrder, payment_status: "paid" }}
          onPress={jest.fn()}
          testID="order-row"
        />
      );
    });
    expect(
      toText(listTree.root.findByProps({ testID: "order-row-payment-method" }).props.children)
    ).toContain("Pay with Wallet Mock");

    let detailTree;
    await act(async () => {
      detailTree = renderer.create(
        <MyOrderDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{
            params: {
              orderDetail: {
                ...baseOrder,
                payment_status: "failed",
                payment_failure_reason: "timeout",
              },
            },
          }}
        />
      );
    });
    expect(
      detailTree.root.findByProps({ testID: "my-order-detail-payment-detail" }).props.children
    ).toContain("timed out");

    let adminTree;
    await act(async () => {
      adminTree = renderer.create(
        <ViewOrderDetailScreen
          navigation={{ goBack: jest.fn() }}
          route={{
            params: {
              orderDetail: {
                ...baseOrder,
                payment_status: "failed",
                payment_failure_reason: "declined",
              },
            },
          }}
        />
      );
    });
    expect(
      toText(adminTree.root.findByProps({ testID: "view-order-detail-payment-reason" }).props.children)
    ).toContain("declined");
  });
});
