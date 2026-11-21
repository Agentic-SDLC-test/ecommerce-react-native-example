import React from "react";
import renderer, { act } from "react-test-renderer";
import CheckoutScreen from "../screens/user/CheckoutScreen";
import * as api from "../api";

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));
jest.mock("react-native-progress-dialog", () => "ProgressDialog");
jest.mock("../api", () => ({ checkout: jest.fn() }));
const mockEmptyCart = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (fn) => fn({ product: [{ _id: "p1", title: "T", price: 10, quantity: 2 }] }),
  useDispatch: () => jest.fn(),
}));
jest.mock("redux", () => ({ bindActionCreators: () => ({ emptyCart: mockEmptyCart }) }));
jest.mock("../states/actionCreaters/actionCreaters", () => ({}));
jest.mock("../utils/paymentSimulator", () => {
  const actual = jest.requireActual("../utils/paymentSimulator");
  return {
    ...actual,
    simulateCardPayment: (args) => actual.simulateCardPayment({ ...args, delayMs: 0 }),
  };
});

const byId = (tree, id) => tree.root.findByProps({ testID: id });
const type = (tree, id, text) => act(() => byId(tree, id).props.onChangeText(text));

const setup = async () => {
  const navigation = { replace: jest.fn(), goBack: jest.fn() };
  let tree;
  await act(async () => {
    tree = renderer.create(<CheckoutScreen navigation={navigation} route={{}} />);
  });
  await type(tree, "checkout-country-input", "CA");
  await type(tree, "checkout-city-input", "Toronto");
  await type(tree, "checkout-street-input", "1 Main");
  return { tree, navigation };
};

const submit = async (tree) => {
  await act(async () => {
    await byId(tree, "checkout-submit-btn").props.onPress();
  });
};

const fillCard = async (tree, number = "4242424242424242") => {
  await type(tree, "checkout-card-name-input", "Demo");
  await type(tree, "checkout-card-number-input", number);
  await type(tree, "checkout-card-expiry-input", "12/30");
  await type(tree, "checkout-card-cvc-input", "123");
};

beforeEach(() => {
  jest.clearAllMocks();
  api.checkout.mockResolvedValue({ success: true, data: { orderId: "X" } });
});

describe("CheckoutScreen payment", () => {
  it("defaults to COD and submits cod/pending", async () => {
    const { tree, navigation } = await setup();
    expect(byId(tree, "checkout-method-value").props.children).toBe("Cash On Delivery");
    await submit(tree);
    expect(api.checkout).toHaveBeenCalledTimes(1);
    expect(api.checkout.mock.calls[0][0]).toMatchObject({
      payment_type: "cod",
      payment_status: "pending",
    });
    expect(mockEmptyCart).toHaveBeenCalled();
    expect(navigation.replace).toHaveBeenCalledWith("orderconfirm", { order: { orderId: "X" } });
  });

  it("submits online/paid after a successful card payment, without card data", async () => {
    const { tree } = await setup();
    await act(async () => byId(tree, "checkout-method-selector-online").props.onPress());
    await fillCard(tree);
    await submit(tree);
    const payload = api.checkout.mock.calls[0][0];
    expect(payload).toMatchObject({ payment_type: "online", payment_status: "paid" });
    expect(JSON.stringify(payload)).not.toContain("4242");
    expect(JSON.stringify(payload)).not.toContain("123");
  });

  it("does not create an order when the payment fails and keeps the cart", async () => {
    const { tree, navigation } = await setup();
    await act(async () => byId(tree, "checkout-method-selector-online").props.onPress());
    await fillCard(tree, "4000000000000002");
    await submit(tree);
    expect(api.checkout).not.toHaveBeenCalled();
    expect(mockEmptyCart).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(byId(tree, "checkout-payment-error").props.children).toBe(
      "Payment declined (demo). Try again or choose Cash On Delivery."
    );
  });

  it("requires demo card details", async () => {
    const { tree } = await setup();
    await act(async () => byId(tree, "checkout-method-selector-online").props.onPress());
    await submit(tree);
    expect(api.checkout).not.toHaveBeenCalled();
    expect(byId(tree, "checkout-payment-error").props.children).toBe(
      "Please fill in the demo card details"
    );
  });
});
