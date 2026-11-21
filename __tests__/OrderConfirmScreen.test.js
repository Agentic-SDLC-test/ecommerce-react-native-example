import React from "react";
import renderer, { act } from "react-test-renderer";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));
jest.mock("../utils/session", () => ({ getUser: jest.fn(() => Promise.resolve({})) }));

const render = async (route) => {
  let tree;
  await act(async () => {
    tree = renderer.create(<OrderConfirmScreen navigation={{ replace: jest.fn() }} route={route} />);
  });
  return tree;
};

describe("OrderConfirmScreen", () => {
  it("shows the payment badge for a paid card order", async () => {
    const tree = await render({
      params: { order: { orderId: "A1", payment_type: "online", payment_status: "paid" } },
    });
    expect(tree.root.findByProps({ testID: "order-confirm-payment-text" }).props.children).toBe(
      "Card (demo) · Paid"
    );
  });
  it("shows COD pay on delivery", async () => {
    const tree = await render({
      params: { order: { orderId: "A2", payment_type: "cod", payment_status: "pending" } },
    });
    expect(tree.root.findByProps({ testID: "order-confirm-payment-text" }).props.children).toBe(
      "Cash On Delivery · Pay on delivery"
    );
  });
  it("does not crash without params", async () => {
    const tree = await render(undefined);
    expect(tree.root.findAllByProps({ testID: "order-confirm-payment" })).toHaveLength(0);
  });
});
