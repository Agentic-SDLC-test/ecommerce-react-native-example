import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  getDefaultPaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  isSupportedPaymentMethod,
} from "../utils/payment";

describe("payment helpers", () => {
  it("returns labels for supported payment methods", () => {
    expect(getPaymentMethodLabel(PAYMENT_METHODS.COD)).toBe("Cash on Delivery");
    expect(getPaymentMethodLabel(PAYMENT_METHODS.MOCK_WALLET)).toBe("Mock Wallet");
  });

  it("returns default statuses for checkout methods", () => {
    expect(getDefaultPaymentStatus(PAYMENT_METHODS.COD)).toBe(PAYMENT_STATUSES.PENDING);
    expect(getDefaultPaymentStatus(PAYMENT_METHODS.MOCK_WALLET)).toBe(PAYMENT_STATUSES.PAID);
    expect(getDefaultPaymentStatus("unknown")).toBe(PAYMENT_STATUSES.PENDING);
  });

  it("returns a legacy COD fallback when payment status is missing", () => {
    expect(getPaymentStatusLabel(undefined, PAYMENT_METHODS.COD)).toBe(
      "Payment due on delivery"
    );
  });

  it("returns labels for supported payment statuses", () => {
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAID, PAYMENT_METHODS.MOCK_WALLET)).toBe(
      "Paid with mock wallet"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.FAILED)).toBe("Payment failed");
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.AWAITING_ACTION)).toBe(
      "Awaiting payment action"
    );
  });

  it("returns safe fallbacks for unknown values", () => {
    expect(getPaymentMethodLabel("bitcoin")).toBe("Unknown payment method");
    expect(getPaymentStatusLabel("settled")).toBe("Unknown payment status");
    expect(isSupportedPaymentMethod("bitcoin")).toBe(false);
  });
});
