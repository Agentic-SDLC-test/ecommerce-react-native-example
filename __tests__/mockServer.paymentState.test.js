/**
 * @jest-environment node
 */
/* global describe, it, expect */

const {
  PAYMENT_STATUSES,
  canAdvanceFulfillment,
  canTransitionPaymentStatus,
  getInitialPaymentStatus,
  getPaymentStatusLabel,
  normalizeOrderPaymentFields,
} = require("../mock-server/paymentState");

describe("mock-server paymentState helpers", () => {
  it("derives initial payment statuses by payment type", () => {
    expect(getInitialPaymentStatus("cod")).toBe("pay_on_delivery");
    expect(getInitialPaymentStatus("wallet")).toBe("pending");
  });

  it("maps payment status labels", () => {
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAY_ON_DELIVERY)).toBe(
      "Pay on delivery"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PENDING)).toBe(
      "Pending payment"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAID)).toBe("Paid");
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.FAILED)).toBe(
      "Payment failed"
    );
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.CANCELLED)).toBe(
      "Payment cancelled"
    );
  });

  it("enforces wallet payment transitions", () => {
    expect(canTransitionPaymentStatus("pending", "paid")).toBe(true);
    expect(canTransitionPaymentStatus("pending", "failed")).toBe(true);
    expect(canTransitionPaymentStatus("failed", "pending")).toBe(true);
    expect(canTransitionPaymentStatus("cancelled", "pending")).toBe(true);
    expect(canTransitionPaymentStatus("paid", "failed")).toBe(false);
  });

  it("blocks fulfillment advancement for unpaid wallet orders", () => {
    expect(
      canAdvanceFulfillment(
        { payment_type: "wallet", payment_status: "pending" },
        "shipped"
      )
    ).toBe(false);
    expect(
      canAdvanceFulfillment(
        { payment_type: "wallet", payment_status: "paid" },
        "shipped"
      )
    ).toBe(true);
    expect(
      canAdvanceFulfillment(
        { payment_type: "cod", payment_status: "pay_on_delivery" },
        "shipped"
      )
    ).toBe(true);
  });

  it("backfills missing payment fields for seeded orders", () => {
    const order = normalizeOrderPaymentFields({
      payment_type: "cod",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });

    expect(order.payment_status).toBe("pay_on_delivery");
    expect(order.payment_updated_at).toBe("2024-01-02T00:00:00.000Z");
  });
});
