const serverPayment = require("../mock-server/payment");
const appPayment = require("../constants/Payment");

// /mock-server/ is excluded from jest test *discovery*, but its modules are
// importable — which is what lets the server invariants get real coverage.

describe("app and mock-server payment vocabulary", () => {
  it("keeps PAYMENT_METHODS identical on both sides", () => {
    expect({ ...serverPayment.PAYMENT_METHODS }).toEqual({
      ...appPayment.PAYMENT_METHODS,
    });
  });

  it("keeps PAYMENT_STATUSES identical on both sides", () => {
    expect({ ...serverPayment.PAYMENT_STATUSES }).toEqual({
      ...appPayment.PAYMENT_STATUSES,
    });
  });
});

describe("withPaymentDefaults", () => {
  const createdAt = "2024-01-15T10:30:00.000Z";

  it("defaults a legacy row to cash on delivery, due on delivery", () => {
    const result = serverPayment.withPaymentDefaults({ createdAt });

    expect(result.payment_type).toBe("cod");
    expect(result.payment_status).toBe("due_on_delivery");
    expect(result.payment_reference).toBeNull();
    expect(result.payment_status_updated_at).toBe(createdAt);
  });

  it("never upgrades a legacy row to paid", () => {
    [
      { createdAt },
      { createdAt, payment_type: "card" },
      { createdAt, payment_status: "weird" },
      { createdAt, payment_status: undefined },
    ].forEach((order) => {
      expect(serverPayment.withPaymentDefaults(order).payment_status).not.toBe(
        "paid"
      );
    });
  });

  it("preserves an explicit paid status and its reference", () => {
    const result = serverPayment.withPaymentDefaults({
      createdAt,
      payment_type: "card",
      payment_status: "paid",
      payment_reference: "SIMPAY-1705400000000-DEMO",
      payment_status_updated_at: "2024-01-16T11:15:00.000Z",
    });

    expect(result.payment_type).toBe("card");
    expect(result.payment_status).toBe("paid");
    expect(result.payment_reference).toBe("SIMPAY-1705400000000-DEMO");
    expect(result.payment_status_updated_at).toBe("2024-01-16T11:15:00.000Z");
  });

  it("returns a copy and leaves the stored row alone", () => {
    const order = { createdAt };
    const result = serverPayment.withPaymentDefaults(order);

    expect(result).not.toBe(order);
    expect(order.payment_status).toBeUndefined();
  });

  it("leaves the fulfilment status untouched", () => {
    const result = serverPayment.withPaymentDefaults({
      createdAt,
      status: "shipped",
    });

    expect(result.status).toBe("shipped");
  });
});

describe("validatePaymentFields", () => {
  it("rejects a cash order recorded as paid", () => {
    const result = serverPayment.validatePaymentFields({
      payment_type: "cod",
      payment_status: "paid",
      payment_reference: null,
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      "Cash on delivery orders cannot be recorded as paid"
    );
  });

  it("rejects any cash order that is not due on delivery", () => {
    ["failed", "not_completed"].forEach((status) => {
      const result = serverPayment.validatePaymentFields({
        payment_type: "cod",
        payment_status: status,
        payment_reference: null,
      });
      expect(result.valid).toBe(false);
    });
  });

  it("accepts a cash order that is due on delivery", () => {
    const result = serverPayment.validatePaymentFields({
      payment_type: "cod",
      payment_status: "due_on_delivery",
      payment_reference: null,
    });

    expect(result).toEqual({ valid: true, message: "" });
  });

  it("rejects a paid card order with no reference", () => {
    const result = serverPayment.validatePaymentFields({
      payment_type: "card",
      payment_status: "paid",
      payment_reference: null,
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("A paid card order requires a payment_reference");
  });

  it("accepts a paid card order with a reference", () => {
    const result = serverPayment.validatePaymentFields({
      payment_type: "card",
      payment_status: "paid",
      payment_reference: "SIMPAY-1705400000000-DEMO",
    });

    expect(result).toEqual({ valid: true, message: "" });
  });

  it("rejects an unknown payment_type", () => {
    const result = serverPayment.validatePaymentFields({
      payment_type: "bitcoin",
      payment_status: "paid",
      payment_reference: "SIMPAY-1-ABCD",
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Invalid payment_type");
  });

  it("rejects an unknown payment_status", () => {
    const result = serverPayment.validatePaymentFields({
      payment_type: "card",
      payment_status: "settled",
      payment_reference: "SIMPAY-1-ABCD",
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Invalid payment_status");
  });
});
