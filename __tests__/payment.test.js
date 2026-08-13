import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  resolvePaymentStatus,
  PAYMENT_TYPES,
  PAYMENT_STATUSES,
  DEMO_CARD_FAIL_SUFFIX,
  ENABLE_DIGITAL_PAYMENT,
} from "../constants/Payment";

describe("Payment constants", () => {
  it("exposes digital payment kill switch and fail suffix", () => {
    expect(ENABLE_DIGITAL_PAYMENT).toBe(true);
    expect(DEMO_CARD_FAIL_SUFFIX).toBe("0000");
  });

  it("labels known payment methods", () => {
    expect(getPaymentMethodLabel(PAYMENT_TYPES.COD)).toBe("Cash on Delivery");
    expect(getPaymentMethodLabel(PAYMENT_TYPES.CARD)).toBe("Card (Demo)");
  });

  it("falls back for unknown payment methods", () => {
    expect(getPaymentMethodLabel("wallet")).toBe("wallet");
    expect(getPaymentMethodLabel(undefined)).toBe("Unknown");
  });

  it("labels known payment statuses", () => {
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.COD_PENDING)).toBe(
      "Pay on delivery"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAID)).toBe("Paid");
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PENDING)).toBe(
      "Payment pending"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.FAILED)).toBe(
      "Payment failed"
    );
  });

  it("falls back for unknown payment statuses", () => {
    expect(getPaymentStatusLabel("mystery")).toBe("mystery");
    expect(getPaymentStatusLabel(undefined)).toBe("Unknown");
  });

  it("resolves missing payment_status for COD and digital orders", () => {
    expect(resolvePaymentStatus({ payment_type: "cod" })).toBe("cod_pending");
    expect(resolvePaymentStatus({ payment_type: "card" })).toBe("pending");
    expect(
      resolvePaymentStatus({ payment_type: "card", payment_status: "paid" })
    ).toBe("paid");
  });
});
