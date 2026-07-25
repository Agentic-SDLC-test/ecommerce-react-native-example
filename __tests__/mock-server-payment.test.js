const {
  canAdvanceFulfillment,
  normalizeOrderPayment,
  resolveInitialPaymentStatus,
  updateOrderPayment,
} = require("../mock-server/payment");

describe("mock-server payment helpers", () => {
  it("defaults legacy orders to pay on delivery", () => {
    const order = normalizeOrderPayment({
      payment_type: "cod",
      updatedAt: "2026-07-25T05:40:00.000Z",
    });

    expect(order.payment_status).toBe("pay_on_delivery");
    expect(order.payment_updated_at).toBe("2026-07-25T05:40:00.000Z");
    expect(resolveInitialPaymentStatus("wallet")).toBe("pending");
  });

  it("allows pending wallet payments to move to paid", () => {
    const order = normalizeOrderPayment({
      payment_type: "wallet",
      payment_status: "pending",
      updatedAt: "2026-07-25T05:40:00.000Z",
    });

    const result = updateOrderPayment(order, "paid", {
      payment_reference: "mock-wallet-123",
    });

    expect(result.ok).toBe(true);
    expect(order.payment_status).toBe("paid");
    expect(order.payment_reference).toBe("mock-wallet-123");
    expect(order.payment_failure_reason).toBeNull();
  });

  it("rejects terminal payment flips", () => {
    const order = normalizeOrderPayment({
      payment_type: "wallet",
      payment_status: "paid",
      updatedAt: "2026-07-25T05:40:00.000Z",
    });

    const result = updateOrderPayment(order, "failed", {
      failure_reason: "user_cancelled",
    });

    expect(result).toEqual({
      ok: false,
      message: "Cannot change payment after terminal resolution",
    });
  });

  it("blocks unpaid digital orders from shipping", () => {
    const unpaidWalletOrder = normalizeOrderPayment({
      payment_type: "wallet",
      payment_status: "pending",
      updatedAt: "2026-07-25T05:40:00.000Z",
    });

    expect(canAdvanceFulfillment(unpaidWalletOrder, "shipped")).toBe(false);
    expect(canAdvanceFulfillment(unpaidWalletOrder, "pending")).toBe(true);
  });
});
