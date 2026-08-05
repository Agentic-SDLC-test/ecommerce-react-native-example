jest.mock("react-native-progress-dialog", () => "ProgressDialog");
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("../api", () => ({
  checkout: jest.fn(),
}));

const mockEmptyCart = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn((selector) =>
    selector({
      product: [
        { _id: "prod001", title: "Classic White T-Shirt", price: 19.99, quantity: 2 },
      ],
    })
  ),
}));

jest.mock("redux", () => ({
  bindActionCreators: jest.fn(() => ({
    emptyCart: mockEmptyCart,
  })),
}));

import React from "react";
import renderer, { act } from "react-test-renderer";
import CheckoutScreen, {
  buildCheckoutPayload,
  canSubmitOrder,
} from "../screens/user/CheckoutScreen";

describe("checkout payment selection", () => {
  beforeEach(() => {
    mockEmptyCart.mockClear();
  });

  it("builds an enriched checkout payload with payment metadata", () => {
    expect(
      buildCheckoutPayload({
        cartItems: [
          { _id: "prod001", price: "20", quantity: "2" },
          { _id: "prod002", price: "10", quantity: "1" },
        ],
        paymentType: "wallet_mock",
        paymentStatus: "failed",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
      })
    ).toEqual({
      items: [
        { productId: "prod001", price: "20", quantity: "2" },
        { productId: "prod002", price: "10", quantity: "1" },
      ],
      amount: 50,
      discount: 0,
      payment_type: "wallet_mock",
      payment_status: "failed",
      country: "Canada",
      city: "Toronto",
      zipcode: "M5V 3A8",
      shippingAddress: "123 Main Street",
      status: "pending",
    });
  });

  it("requires address fields before checkout can submit", () => {
    expect(
      canSubmitOrder({
        country: "Canada",
        city: "Toronto",
        streetAddress: "123 Main Street",
        zipcode: "M5V 3A8",
        paymentType: "cod",
        paymentStatus: "awaiting_payment",
      })
    ).toBe(true);

    expect(
      canSubmitOrder({
        country: "Canada",
        city: "",
        streetAddress: "123 Main Street",
        zipcode: "M5V 3A8",
        paymentType: "wallet_mock",
        paymentStatus: "paid",
      })
    ).toBe(false);
  });

  it("reveals wallet outcome choices when the digital method is selected", () => {
    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    let tree;
    act(() => {
      tree = renderer.create(<CheckoutScreen navigation={navigation} />);
    });
    const walletOption = tree.root.findByProps({
      testID: "checkout-payment-method-wallet_mock",
    });

    expect(() =>
      tree.root.findByProps({ testID: "checkout-wallet-outcomes" })
    ).toThrow();

    act(() => {
      walletOption.props.onPress();
    });

    expect(
      tree.root.findByProps({ testID: "checkout-wallet-outcomes" })
    ).toBeTruthy();
    expect(
      tree.root.findByProps({ testID: "checkout-demo-payment-helper" }).props
        .children
    ).toBe("Choose a mock wallet outcome for checkout demos.");
  });
});
