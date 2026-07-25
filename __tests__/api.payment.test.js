/* global jest, describe, it, expect */

jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const { checkout, updateOrderPaymentStatus } = require("../api");
const { post } = require("../api/client");

describe("payment api seam", () => {
  it("keeps checkout routed through the checkout endpoint", () => {
    const payload = { payment_type: "wallet" };
    checkout(payload);

    expect(post).toHaveBeenCalledWith("/checkout", payload);
  });

  it("posts wallet payment status updates to the new route", () => {
    updateOrderPaymentStatus("order-1", "paid");

    expect(post).toHaveBeenCalledWith("/order-payment-status", {
      orderId: "order-1",
      payment_status: "paid",
    });
  });
});
