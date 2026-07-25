/* global describe, it, expect */

import {
  buildCheckoutPayload,
  getCheckoutSubmitLabel,
  hasRequiredShippingAddress,
} from "../utils/checkoutFlow";

describe("checkoutFlow helpers", () => {
  it("builds a checkout payload with payment type and computed amount", () => {
    const payload = buildCheckoutPayload(
      [
        { _id: "prod-1", price: "10", quantity: "2" },
        { _id: "prod-2", price: 4.5, quantity: 1 },
      ],
      {
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      },
      "wallet"
    );

    expect(payload).toEqual({
      items: [
        { productId: "prod-1", price: 10, quantity: 2 },
        { productId: "prod-2", price: 4.5, quantity: 1 },
      ],
      amount: 24.5,
      discount: 0,
      payment_type: "wallet",
      country: "Canada",
      city: "Toronto",
      zipcode: "M5V",
      shippingAddress: "123 Main Street",
    });
  });

  it("requires all shipping fields", () => {
    expect(
      hasRequiredShippingAddress({
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      })
    ).toBe(true);

    expect(
      hasRequiredShippingAddress({
        country: "Canada",
        city: "",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      })
    ).toBe(false);
  });

  it("switches submit label for wallet flow", () => {
    expect(getCheckoutSubmitLabel("cod")).toBe("Submit Order");
    expect(getCheckoutSubmitLabel("wallet")).toBe("Continue to Wallet");
  });
});
