/* global describe, it, expect */
import {
  buildCheckoutPayload,
  getAddressSummary,
  hasCompleteAddress,
} from "../utils/checkout";

describe("checkout helpers", () => {
  const cartItems = [
    { _id: "prod001", price: 10, quantity: 2 },
    { _id: "prod002", price: 5, quantity: 1 },
  ];

  it("builds a COD checkout payload", () => {
    expect(
      buildCheckoutPayload({
        cartItems,
        selectedPaymentType: "cod",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      })
    ).toEqual({
      items: [
        { productId: "prod001", price: 10, quantity: 2 },
        { productId: "prod002", price: 5, quantity: 1 },
      ],
      amount: 25,
      discount: 0,
      payment_type: "cod",
      payment_acknowledged: false,
      country: "Canada",
      city: "Toronto",
      zipcode: "M5V",
      shippingAddress: "123 Main Street",
    });
  });

  it("requires a shipping address", () => {
    expect(() =>
      buildCheckoutPayload({
        cartItems,
        selectedPaymentType: "cod",
        country: "Canada",
        city: "",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      })
    ).toThrow("Add a shipping address before checkout");
  });

  it("preserves wallet acknowledgement for wallet mock payments", () => {
    expect(
      buildCheckoutPayload({
        cartItems,
        selectedPaymentType: "wallet_mock",
        paymentAcknowledged: true,
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      }).payment_acknowledged
    ).toBe(true);
  });

  it("summarizes addresses and validates completeness", () => {
    expect(
      getAddressSummary({
        country: "Canada",
        city: "Toronto",
        shippingAddress: "123 Main Street",
      })
    ).toBe("123 Main Street, Toronto, Canada");

    expect(
      hasCompleteAddress({
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      })
    ).toBe(true);
  });
});
