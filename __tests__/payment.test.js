import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  PAYMENT_STATUSES,
} from "../constants/payment";
import {
  isValidPaymentMethod,
  resolvePaymentStatus,
  buildCheckoutPayload,
} from "../utils/paymentHelper";

describe("payment constants", () => {
  it("returns Cash on Delivery label for cod", () => {
    expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
  });

  it("returns Pay with Wallet label for wallet", () => {
    expect(getPaymentMethodLabel("wallet")).toBe("Pay with Wallet");
  });

  it("returns Unknown for unknown method", () => {
    expect(getPaymentMethodLabel("card")).toBe("Unknown");
  });

  it("returns Pay on delivery for pay_on_delivery status", () => {
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAY_ON_DELIVERY)).toBe(
      "Pay on delivery"
    );
  });

  it("returns Paid for paid status", () => {
    expect(getPaymentStatusLabel(PAYMENT_STATUSES.PAID)).toBe("Paid");
  });

  it("returns dash for unknown status", () => {
    expect(getPaymentStatusLabel("unknown")).toBe("—");
  });
});

describe("paymentHelper", () => {
  it("validates known payment methods", () => {
    expect(isValidPaymentMethod("cod")).toBe(true);
    expect(isValidPaymentMethod("wallet")).toBe(true);
    expect(isValidPaymentMethod("card")).toBe(false);
  });

  it("resolves payment status from payment type", () => {
    expect(resolvePaymentStatus("cod")).toBe(PAYMENT_STATUSES.PAY_ON_DELIVERY);
    expect(resolvePaymentStatus("wallet")).toBe(PAYMENT_STATUSES.PAID);
    expect(resolvePaymentStatus("card")).toBeNull();
  });

  it("builds checkout payload with payment fields", () => {
    const payload = buildCheckoutPayload({
      cartItems: [{ _id: "prod001", price: 10, quantity: 2 }],
      addressFields: {
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        streetAddress: "123 Main St",
      },
      paymentType: "wallet",
      paymentStatus: PAYMENT_STATUSES.PAID,
      totalAmount: 20,
    });

    expect(payload).toEqual({
      items: [{ productId: "prod001", price: 10, quantity: 2 }],
      amount: 20,
      discount: 0,
      payment_type: "wallet",
      payment_status: PAYMENT_STATUSES.PAID,
      country: "Canada",
      city: "Toronto",
      zipcode: "M5V",
      shippingAddress: "123 Main St",
      status: "pending",
    });
  });
});
