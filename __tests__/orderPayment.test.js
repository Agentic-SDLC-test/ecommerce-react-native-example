/* global describe, it, expect */
const {
  derivePaymentFields,
  serializeOrder,
} = require("../mock-server/orderPayment");

describe("mock server order payment helpers", () => {
  it("derives COD payment fields", () => {
    expect(derivePaymentFields({ payment_type: "cod" })).toEqual({
      payment_type: "cod",
      payment_status: "pending",
      payment_reference: null,
      payment_message: "Pay on delivery",
    });
  });

  it("derives wallet mock payment fields", () => {
    const fields = derivePaymentFields({
      payment_type: "wallet_mock",
      payment_acknowledged: true,
    });

    expect(fields.payment_type).toBe("wallet_mock");
    expect(fields.payment_status).toBe("paid");
    expect(fields.payment_reference).toMatch(/^MOCK-/);
    expect(fields.payment_message).toBe(
      "Mock wallet payment recorded. No live charge was made."
    );
  });

  it("rejects wallet mock without acknowledgement", () => {
    expect(() =>
      derivePaymentFields({
        payment_type: "wallet_mock",
        payment_acknowledged: false,
      })
    ).toThrow("Wallet mock acknowledgement is required");
  });

  it("normalizes legacy orders", () => {
    expect(
      serializeOrder({
        orderId: "ORD-1",
        payment_type: "cod",
      })
    ).toMatchObject({
      orderId: "ORD-1",
      payment_type: "cod",
      payment_status: "pending",
      payment_reference: null,
      payment_message: "Pay on delivery",
    });
  });
});
