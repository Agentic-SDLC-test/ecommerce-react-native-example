/* eslint-env jest */

jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { checkout, updateOrderPaymentStatus } from "../api";
import { post } from "../api/client";

describe("api payment helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards checkout payloads unchanged", () => {
    const payload = {
      items: [{ productId: "prod001", price: 20, quantity: 2 }],
      amount: 40,
      payment_type: "wallet",
    };

    checkout(payload);

    expect(post).toHaveBeenCalledWith("/checkout", payload);
  });

  it("posts wallet payment updates to the flat endpoint contract", () => {
    updateOrderPaymentStatus("order001", "paid");

    expect(post).toHaveBeenCalledWith("/order-payment-status?orderId=order001", {
      payment_status: "paid",
    });
  });
});
