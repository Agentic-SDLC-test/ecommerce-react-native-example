import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  resolvePaymentStatus,
  validateDemoCard,
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

describe("validateDemoCard", () => {
  it("accepts a valid demo card", () => {
    expect(
      validateDemoCard({
        cardNumber: "4111111111111111",
        cardExpiry: "12/30",
        cardCvv: "123",
      })
    ).toEqual({ ok: true });
  });

  it("rejects missing fields", () => {
    expect(
      validateDemoCard({
        cardNumber: "",
        cardExpiry: "12/30",
        cardCvv: "123",
      })
    ).toEqual({
      ok: false,
      message: "Enter demo card number, expiry, and CVV.",
    });
    expect(
      validateDemoCard({
        cardNumber: "4111111111111111",
        cardExpiry: "",
        cardCvv: "123",
      })
    ).toEqual({
      ok: false,
      message: "Enter demo card number, expiry, and CVV.",
    });
    expect(
      validateDemoCard({
        cardNumber: "4111111111111111",
        cardExpiry: "12/30",
        cardCvv: "",
      })
    ).toEqual({
      ok: false,
      message: "Enter demo card number, expiry, and CVV.",
    });
  });

  it("rejects short card numbers", () => {
    expect(
      validateDemoCard({
        cardNumber: "41111111111",
        cardExpiry: "12/30",
        cardCvv: "123",
      })
    ).toEqual({
      ok: false,
      message: "Demo card number must be at least 12 digits.",
    });
  });

  it("rejects demo fail suffix without placing an order", () => {
    expect(
      validateDemoCard({
        cardNumber: "4111111111110000",
        cardExpiry: "12/30",
        cardCvv: "123",
      })
    ).toEqual({
      ok: false,
      message:
        "Demo card payment failed. Try another test card (do not end with 0000).",
    });
  });
});
