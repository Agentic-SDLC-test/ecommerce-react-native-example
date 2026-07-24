const paymentUtils = require("../utils/orderPayment");
const features = require("../utils/features");

describe("order payment utilities", () => {
  const previousFlag = process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER;

  afterEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER = previousFlag;
  });

  it("normalizes payment types and derives legacy payment states", () => {
    expect(paymentUtils.normalizePaymentType("card")).toBe("card");
    expect(paymentUtils.normalizePaymentType("wallet")).toBe("cod");

    expect(paymentUtils.derivePaymentStatus({ payment_type: "cod" })).toBe(
      "due_on_delivery"
    );
    expect(
      paymentUtils.derivePaymentStatus({ payment_type: "card", status: "pending" })
    ).toBe("awaiting_payment");
    expect(
      paymentUtils.derivePaymentStatus({ payment_type: "card", status: "delivered" })
    ).toBe("paid");
    expect(
      paymentUtils.derivePaymentStatus({
        payment_type: "card",
        payment_status: "payment_issue",
        status: "delivered",
      })
    ).toBe("payment_issue");
  });

  it("returns shopper-facing payment labels and disclaimer rules", () => {
    expect(paymentUtils.getPaymentMethodLabel("cod")).toBe("Cash on delivery");
    expect(paymentUtils.getPaymentMethodLabel("card")).toBe("Card demo");
    expect(paymentUtils.getPaymentStatusLabel("paid")).toBe("Paid");
    expect(
      paymentUtils.getPaymentDisclaimer({ payment_type: "card", status: "pending" })
    ).toBe("Demo payment only - no real card charge was made.");
    expect(paymentUtils.getPaymentDisclaimer({ payment_type: "cod" })).toBeNull();
    expect(
      paymentUtils.canResolveDemoPayment({
        payment_type: "card",
        payment_status: "awaiting_payment",
      })
    ).toBe(true);
    expect(paymentUtils.canResolveDemoPayment({ payment_type: "cod" })).toBe(false);
  });

  it("reads the digital payment feature flag with the existing env pattern", () => {
    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER = "true";
    expect(features.isDigitalPaymentPlaceholderEnabled()).toBe(true);

    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER = "FALSE";
    expect(features.isDigitalPaymentPlaceholderEnabled()).toBe(false);
  });
});
