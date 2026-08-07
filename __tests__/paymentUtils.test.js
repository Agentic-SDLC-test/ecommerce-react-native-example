import {
  DIGITAL_PAYMENT_ENABLED,
  formatPaymentMethod,
  formatPaymentStatus,
  getMockOutcomeOptions,
  getPaymentMessage,
  getPaymentMethodOptions,
  normalizePaymentStatus,
} from "../utils/payment";

describe("payment utils", () => {
  it("returns COD and wallet options when digital payments are enabled", () => {
    expect(DIGITAL_PAYMENT_ENABLED).toBe(true);
    expect(getPaymentMethodOptions()).toEqual([
      { label: "Cash on Delivery", value: "cod" },
      { label: "Pay with Wallet (Mock)", value: "wallet_mock" },
    ]);
  });

  it("returns the supported wallet outcomes in display order", () => {
    expect(getMockOutcomeOptions()).toEqual([
      { label: "Paid", value: "paid" },
      { label: "Awaiting payment", value: "awaiting_payment" },
      { label: "Payment failed", value: "failed" },
    ]);
  });

  it("normalizes COD to awaiting payment and formats shopper-facing copy", () => {
    expect(normalizePaymentStatus("cod", "paid")).toBe("awaiting_payment");
    expect(formatPaymentMethod("cod")).toBe("Cash on Delivery");
    expect(formatPaymentStatus("cod", "awaiting_payment")).toBe(
      "Awaiting payment"
    );
    expect(getPaymentMessage("cod", "awaiting_payment")).toBe(
      "Pay when the order arrives"
    );
  });

  it("formats the wallet mock success and failure states", () => {
    expect(formatPaymentMethod("wallet_mock")).toBe("Pay with Wallet (Mock)");
    expect(formatPaymentStatus("wallet_mock", "paid")).toBe("Paid");
    expect(getPaymentMessage("wallet_mock", "failed")).toBe(
      "Mock wallet payment failed; order is still unpaid"
    );
  });

  it("rejects unsupported wallet outcomes", () => {
    expect(() => normalizePaymentStatus("wallet_mock", "unknown")).toThrow(
      "Unsupported payment status"
    );
  });
});
