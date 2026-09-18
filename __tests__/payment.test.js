import {
  PAYMENT_METHODS,
  PAYMENT_OPTIONS,
  PAYMENT_STATUSES,
  getCheckoutPaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusDescription,
  getPaymentStatusLabel,
  normalizePaymentStatus,
} from "../utils/payment";

describe("payment helpers", () => {
  it("defines COD and mock wallet checkout options", () => {
    expect(PAYMENT_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: PAYMENT_METHODS.COD,
          label: "Cash on Delivery",
          statusOnCheckout: PAYMENT_STATUSES.PENDING,
        }),
        expect.objectContaining({
          value: PAYMENT_METHODS.MOCK_WALLET,
          label: "Mock Wallet",
          statusOnCheckout: PAYMENT_STATUSES.PAID,
        }),
      ])
    );
  });

  it("labels payment methods and statuses", () => {
    expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    expect(getPaymentMethodLabel("mock_wallet")).toBe("Mock Wallet");
    expect(getPaymentMethodLabel("card")).toBe("Unknown payment method");
    expect(getPaymentStatusLabel("pending")).toBe("Payment pending");
    expect(getPaymentStatusLabel("paid")).toBe("Paid");
    expect(getPaymentStatusLabel("failed")).toBe("Payment failed");
    expect(getPaymentStatusLabel("missing")).toBe("Payment status unavailable");
  });

  it("derives checkout payment statuses", () => {
    expect(getCheckoutPaymentStatus("cod")).toBe("pending");
    expect(getCheckoutPaymentStatus("mock_wallet")).toBe("paid");
    expect(getCheckoutPaymentStatus("unsupported")).toBe("unknown");
  });

  it("normalizes legacy orders without payment_status", () => {
    expect(normalizePaymentStatus({ payment_type: "cod" })).toBe("pending");
    expect(normalizePaymentStatus({ payment_type: "mock_wallet" })).toBe("unknown");
    expect(normalizePaymentStatus({ payment_status: "failed" })).toBe("failed");
  });

  it("explains COD pending, mock wallet paid, failed, and unknown states", () => {
    expect(getPaymentStatusDescription("cod", "pending")).toContain("collected");
    expect(getPaymentStatusDescription("mock_wallet", "paid")).toContain("no further payment action");
    expect(getPaymentStatusDescription("mock_wallet", "failed")).toContain("could not be completed");
    expect(getPaymentStatusDescription("unknown", "unknown")).toContain("unavailable");
  });
});
