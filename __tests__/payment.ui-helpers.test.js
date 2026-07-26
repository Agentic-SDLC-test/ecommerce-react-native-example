/* eslint-env jest */

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock("../api", () => ({
  updateOrderPaymentStatus: jest.fn(),
}));
jest.mock("../utils/session", () => ({
  getUser: jest.fn(),
}));

import React from "react";
import PaymentStatusBadge, {
  getPaymentBadgeModel,
} from "../components/PaymentStatusBadge/PaymentStatusBadge";
import {
  buildCheckoutItems,
  buildCheckoutRequest,
  isDigitalPaymentsEnabled,
} from "../screens/user/CheckoutScreen";
import { getConfirmationMessage } from "../screens/user/OrderConfirmScreen";
import { deriveTrackingState } from "../screens/user/MyOrderDetailScreen";
import { formatTotal, renderOrderMeta } from "../components/OrderList/OrderList";

describe("payment ui helpers", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENTS;
  });

  it("builds checkout payloads with the selected payment type", () => {
    const cartItems = [
      { _id: "prod001", price: 20, quantity: 2 },
      { _id: "prod002", price: 10, quantity: 1 },
    ];

    expect(buildCheckoutItems(cartItems)).toEqual([
      { productId: "prod001", price: 20, quantity: 2 },
      { productId: "prod002", price: 10, quantity: 1 },
    ]);
    expect(
      buildCheckoutRequest({
        cartItems,
        paymentType: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
      })
    ).toEqual(
      expect.objectContaining({
        amount: 50,
        payment_type: "wallet",
      })
    );
  });

  it("gates digital payments only when the env var is explicitly false", () => {
    expect(isDigitalPaymentsEnabled()).toBe(true);
    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENTS = "false";
    expect(isDigitalPaymentsEnabled()).toBe(false);
  });

  it("returns confirmation copy for cod and wallet flows", () => {
    expect(
      getConfirmationMessage({
        payment_type: "cod",
        payment_status: "pending",
        status: "pending",
      })
    ).toContain("Cash on delivery");
    expect(
      getConfirmationMessage({
        payment_type: "wallet",
        payment_status: "pending",
        status: "pending",
      })
    ).toContain("pending wallet payment");
    expect(
      getConfirmationMessage({
        payment_type: "wallet",
        payment_status: "failed",
        status: "pending",
      })
    ).toContain("wallet payment failed");
  });

  it("derives order list totals and payment metadata", () => {
    const order = {
      items: [
        { price: 20, quantity: 2 },
        { price: 10, quantity: 1 },
      ],
      payment_type: "wallet",
      payment_status: "pending",
      status: "pending",
    };

    expect(formatTotal(order.items)).toBe(50);
    expect(renderOrderMeta(order)).toEqual(
      expect.objectContaining({
        quantity: 3,
        totalCost: 50,
        paymentMethodLabel: "Mock Wallet",
        paymentStatus: "pending",
      })
    );
  });

  it("keeps payment badge styling and tracking helpers stable", () => {
    expect(
      getPaymentBadgeModel({
        paymentType: "wallet",
        paymentStatus: "failed",
        fulfillmentStatus: "pending",
      })
    ).toEqual(
      expect.objectContaining({
        status: "failed",
        label: "Failed",
      })
    );

    const element = PaymentStatusBadge({
      paymentType: "wallet",
      paymentStatus: "paid",
      fulfillmentStatus: "pending",
      testID: "badge",
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(deriveTrackingState("pending")).toBe(1);
    expect(deriveTrackingState("shipped")).toBe(2);
    expect(deriveTrackingState("delivered")).toBe(3);
  });
});
