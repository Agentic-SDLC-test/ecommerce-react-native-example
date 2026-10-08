import {
  DEMO_CARD_FAIL_SUFFIX,
  FORBIDDEN_CARD_KEYS,
} from "../constants/Payment";
import {
  buildCheckoutPayload,
  displayPayment,
  paymentMethodLabel,
  paymentStatusLabel,
  validateDemoCard,
} from "../utils/payment";

const DECLINE_MESSAGE =
  "Card was declined (demo). No order was placed. Try another card or switch to Cash on Delivery.";

describe("payment labels", () => {
  it("labels cash on delivery and card", () => {
    expect(paymentMethodLabel("cod")).toBe("Cash on Delivery");
    expect(paymentMethodLabel("card")).toBe("Card (demo)");
  });

  it("labels paid and unpaid", () => {
    expect(paymentStatusLabel("paid")).toBe("Paid");
    expect(paymentStatusLabel("unpaid")).toBe(
      "Unpaid — collected on delivery"
    );
  });

  it("treats missing order fields as cash on delivery and unpaid", () => {
    expect(displayPayment(null)).toEqual({
      methodLabel: "Cash on Delivery",
      statusLabel: "Unpaid — collected on delivery",
    });
    expect(displayPayment({})).toEqual({
      methodLabel: "Cash on Delivery",
      statusLabel: "Unpaid — collected on delivery",
    });
    expect(paymentMethodLabel(undefined)).toBe("Cash on Delivery");
    expect(paymentStatusLabel(undefined)).toBe(
      "Unpaid — collected on delivery"
    );
  });
});

describe("validateDemoCard", () => {
  it("accepts a demo card that does not end in the fail suffix", () => {
    expect(
      validateDemoCard({
        name: "Ada",
        number: "4242424242424242",
        expiry: "12/28",
        cvv: "123",
      })
    ).toEqual({ ok: true, message: "" });
  });

  it("accepts a spaced 16-digit demo card", () => {
    expect(
      validateDemoCard({
        name: "Ada",
        number: "4242 4242 4242 4242",
        expiry: "12/28",
        cvv: "123",
      }).ok
    ).toBe(true);
  });

  it("declines a 16-digit number ending in 0000 without echoing the digits", () => {
    const number = `424242424242${DEMO_CARD_FAIL_SUFFIX}`;
    const result = validateDemoCard({
      name: "Ada",
      number,
      expiry: "12/28",
      cvv: "123",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toBe(DECLINE_MESSAGE);
    expect(result.message).not.toContain(number);
    expect(result.message).not.toContain("123");
    expect(result.message).not.toContain(DEMO_CARD_FAIL_SUFFIX);
  });

  it("returns the format message when the demo card is incomplete", () => {
    const result = validateDemoCard({
      name: " ",
      number: "4242",
      expiry: "13/28",
      cvv: "12",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      "Enter the demo card name, number, expiry (MM/YY), and CVV. This is an example only and does not charge a real card."
    );
    expect(result.message).not.toContain("4242");
  });
});

describe("buildCheckoutPayload", () => {
  it("omits card keys, payment status, and fulfillment status", () => {
    const extra = {
      status: "delivered",
      payment_status: "paid",
    };
    FORBIDDEN_CARD_KEYS.forEach((key) => {
      extra[key] = "4242424242424242";
    });

    const payload = buildCheckoutPayload({
      items: [{ productId: "prod001", price: 10, quantity: 1 }],
      amount: 10,
      discount: 0,
      paymentType: "card",
      country: "Canada",
      city: "Toronto",
      zipcode: "",
      shippingAddress: "123 Main Street",
      ...extra,
    });

    expect(payload).toEqual({
      items: [{ productId: "prod001", price: 10, quantity: 1 }],
      amount: 10,
      discount: 0,
      payment_type: "card",
      country: "Canada",
      city: "Toronto",
      zipcode: "",
      shippingAddress: "123 Main Street",
    });
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("payment_status");
    FORBIDDEN_CARD_KEYS.forEach((key) => {
      expect(payload).not.toHaveProperty(key);
    });
  });
});
