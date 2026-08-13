import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  getPaymentMethodLabel,
  getPaymentStatusForMethod,
  getPaymentStatusLabel,
  normalizeOrderPayment,
} from "../utils/payment";

describe("payment helpers", () => {
  it("defines COD and mock wallet payment methods", () => {
    expect(PAYMENT_METHODS).toHaveLength(2);
    expect(PAYMENT_METHODS.map((m) => m.value)).toEqual(["cod", "mock_wallet"]);
  });

  it("returns Cash On Delivery label for missing or unknown payment types", () => {
    expect(getPaymentMethodLabel(undefined)).toBe("Cash On Delivery");
    expect(getPaymentMethodLabel("cod")).toBe("Cash On Delivery");
    expect(getPaymentMethodLabel("unknown")).toBe("Cash On Delivery");
  });

  it("returns Mock Wallet label for mock_wallet", () => {
    expect(getPaymentMethodLabel("mock_wallet")).toBe("Mock Wallet");
  });

  it("derives payment status from payment method", () => {
    expect(getPaymentStatusForMethod("cod")).toBe(
      PAYMENT_STATUSES.PENDING_COLLECTION
    );
    expect(getPaymentStatusForMethod("mock_wallet")).toBe(PAYMENT_STATUSES.PAID);
  });

  it("returns shopper-facing payment status labels", () => {
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PENDING_COLLECTION)).toBe(
      "Pending collection"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAID, "mock_wallet")).toBe(
      "Mock paid"
    );
  });

  it("normalizes COD orders without payment_status", () => {
    const result = normalizeOrderPayment({ payment_type: "cod" });
    expect(result.payment_type).toBe("cod");
    expect(result.payment_status).toBe(PAYMENT_STATUSES.PENDING_COLLECTION);
    expect(result.methodLabel).toBe("Cash On Delivery");
    expect(result.statusLabel).toBe("Pending collection");
    expect(result.note).toBe("Payment due on delivery.");
  });

  it("normalizes mock wallet orders as paid", () => {
    const result = normalizeOrderPayment({
      payment_type: "mock_wallet",
      payment_status: "paid",
      payment_note: "Mock wallet payment. No real funds moved.",
    });
    expect(result.methodLabel).toBe("Mock Wallet");
    expect(result.statusLabel).toBe("Mock paid");
    expect(result.note).toBe("Mock wallet payment. No real funds moved.");
  });

  it("defaults missing order payment fields to COD pending collection", () => {
    const result = normalizeOrderPayment({});
    expect(result.payment_type).toBe("cod");
    expect(result.payment_status).toBe(PAYMENT_STATUSES.PENDING_COLLECTION);
    expect(result.methodLabel).toBe("Cash On Delivery");
    expect(result.statusLabel).toBe("Pending collection");
  });
});
