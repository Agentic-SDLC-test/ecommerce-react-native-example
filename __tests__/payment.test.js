import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_METHOD_OPTIONS,
} from "../constants/Payment";
import {
  getPaymentMethodOptions,
  isDigitalPaymentEnabled,
  resolvePaymentMethod,
  resolvePaymentStatus,
  paymentMethodLabel,
  paymentStatusLabel,
  paymentConfirmationText,
  paymentReferenceOf,
  paymentUpdatedAt,
  initialPaymentStatusFor,
  buildCheckoutPayload,
} from "../utils/payment";

const CART = [
  { _id: "prod001", price: 19.99, quantity: 2 },
  { _id: "prod003", price: 89.99, quantity: 1 },
];

const ADDRESS = {
  country: "Canada",
  city: "Toronto",
  zipcode: "M5V 3A8",
  streetAddress: "123 Main Street",
};

describe("payment vocabulary", () => {
  it("puts Cash on Delivery first so it reads as the default", () => {
    expect(PAYMENT_METHOD_OPTIONS[0].value).toBe(PAYMENT_METHODS.COD);
    expect(PAYMENT_METHOD_OPTIONS).toHaveLength(2);
    expect(PAYMENT_METHOD_OPTIONS[1].value).toBe(PAYMENT_METHODS.CARD);
  });

  it("labels each option and gives it a hint and an icon", () => {
    PAYMENT_METHOD_OPTIONS.forEach((option) => {
      expect(option.label).toBeTruthy();
      expect(option.hint).toBeTruthy();
      expect(option.icon).toBeTruthy();
    });
  });

  it("distinguishes the four payment states", () => {
    expect(Object.values(PAYMENT_STATUSES)).toEqual([
      "due_on_delivery",
      "paid",
      "failed",
      "not_completed",
    ]);
  });
});

describe("digital payment flag", () => {
  const previous = process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT = previous;
    }
  });

  it("is on when the flag is unset", () => {
    delete process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT;
    expect(isDigitalPaymentEnabled()).toBe(true);
    expect(getPaymentMethodOptions()).toHaveLength(2);
  });

  it('offers COD only when the flag is exactly "false"', () => {
    process.env.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT = "false";
    expect(isDigitalPaymentEnabled()).toBe(false);
    const options = getPaymentMethodOptions();
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe(PAYMENT_METHODS.COD);
  });
});

describe("resolvePaymentStatus", () => {
  it("defaults a missing status to due on delivery", () => {
    expect(resolvePaymentStatus({})).toBe(PAYMENT_STATUSES.DUE_ON_DELIVERY);
  });

  it("defaults an unknown status to due on delivery", () => {
    expect(resolvePaymentStatus({ payment_status: "weird" })).toBe(
      PAYMENT_STATUSES.DUE_ON_DELIVERY
    );
  });

  it("does not throw on a null order", () => {
    expect(() => resolvePaymentStatus(null)).not.toThrow();
    expect(resolvePaymentStatus(null)).toBe(PAYMENT_STATUSES.DUE_ON_DELIVERY);
    expect(resolvePaymentStatus(undefined)).toBe(
      PAYMENT_STATUSES.DUE_ON_DELIVERY
    );
  });

  it("keeps an explicit paid status", () => {
    expect(resolvePaymentStatus({ payment_status: "paid" })).toBe(
      PAYMENT_STATUSES.PAID
    );
  });

  it("never reports a legacy order as paid", () => {
    [{}, null, undefined, { payment_type: "card" }, { payment_status: "" }].forEach(
      (order) => {
        expect(resolvePaymentStatus(order)).not.toBe(PAYMENT_STATUSES.PAID);
      }
    );
  });
});

describe("resolvePaymentMethod", () => {
  it("defaults a missing method to cod", () => {
    expect(resolvePaymentMethod({})).toBe(PAYMENT_METHODS.COD);
    expect(resolvePaymentMethod(null)).toBe(PAYMENT_METHODS.COD);
  });

  it("lower-cases a known method", () => {
    expect(resolvePaymentMethod({ payment_type: "CARD" })).toBe(
      PAYMENT_METHODS.CARD
    );
  });

  it("falls back to cod for an unknown method", () => {
    expect(resolvePaymentMethod({ payment_type: "bitcoin" })).toBe(
      PAYMENT_METHODS.COD
    );
  });
});

describe("payment labels and helpers", () => {
  it("labels method and status for a legacy order", () => {
    expect(paymentMethodLabel({})).toBe("Cash on Delivery");
    expect(paymentStatusLabel({})).toBe("Pay on delivery");
  });

  it("labels a paid card order", () => {
    const order = { payment_type: "card", payment_status: "paid" };
    expect(paymentMethodLabel(order)).toBe("Card (simulated)");
    expect(paymentStatusLabel(order)).toBe("Paid");
  });

  it("returns null rather than undefined for a missing reference or timestamp", () => {
    expect(paymentReferenceOf({})).toBeNull();
    expect(paymentUpdatedAt({})).toBeNull();
    expect(paymentReferenceOf(null)).toBeNull();
    expect(paymentUpdatedAt(null)).toBeNull();
  });
});

describe("paymentConfirmationText", () => {
  it("tells a cash shopper to pay on arrival", () => {
    expect(paymentConfirmationText({ payment_type: "cod" })).toBe(
      "Pay cash when your order arrives"
    );
  });

  it("ignores payment status for a cash order", () => {
    expect(
      paymentConfirmationText({ payment_type: "cod", payment_status: "paid" })
    ).toBe("Pay cash when your order arrives");
  });

  it("says paid by card for a paid card order", () => {
    expect(
      paymentConfirmationText({ payment_type: "card", payment_status: "paid" })
    ).toBe("Paid by card");
  });

  it("says payment not completed for an unpaid card order", () => {
    expect(
      paymentConfirmationText({ payment_type: "card", payment_status: "failed" })
    ).toBe("Payment not completed");
    expect(paymentConfirmationText({ payment_type: "card" })).toBe(
      "Payment not completed"
    );
  });
});

describe("initialPaymentStatusFor", () => {
  it("keeps a cash order due on delivery even when a payment was approved", () => {
    expect(initialPaymentStatusFor("cod", { result: "approved" })).toBe(
      PAYMENT_STATUSES.DUE_ON_DELIVERY
    );
    expect(initialPaymentStatusFor("cod", null)).toBe(
      PAYMENT_STATUSES.DUE_ON_DELIVERY
    );
  });

  it("marks an approved card payment paid", () => {
    expect(initialPaymentStatusFor("card", { result: "approved" })).toBe(
      PAYMENT_STATUSES.PAID
    );
  });

  it("marks a declined card payment failed", () => {
    expect(initialPaymentStatusFor("card", { result: "declined" })).toBe(
      PAYMENT_STATUSES.FAILED
    );
  });

  it("marks anything else on a card order not completed", () => {
    expect(initialPaymentStatusFor("card", null)).toBe(
      PAYMENT_STATUSES.NOT_COMPLETED
    );
    expect(initialPaymentStatusFor("card", { result: "not_completed" })).toBe(
      PAYMENT_STATUSES.NOT_COMPLETED
    );
  });

  it("throws on an unknown method", () => {
    expect(() => initialPaymentStatusFor("nope", null)).toThrow(
      "Unknown payment method: nope"
    );
  });
});

describe("buildCheckoutPayload", () => {
  it("returns the exact expected key set", () => {
    const payload = buildCheckoutPayload({
      cartItems: CART,
      address: ADDRESS,
      paymentMethod: PAYMENT_METHODS.COD,
      paymentResult: null,
    });

    expect(Object.keys(payload).sort()).toEqual(
      [
        "amount",
        "city",
        "country",
        "discount",
        "items",
        "payment_reference",
        "payment_status",
        "payment_type",
        "shippingAddress",
        "status",
        "zipcode",
      ].sort()
    );
  });

  it("carries no card-shaped key", () => {
    const payload = buildCheckoutPayload({
      cartItems: CART,
      address: ADDRESS,
      paymentMethod: PAYMENT_METHODS.CARD,
      paymentResult: { result: "approved", reference: "SIMPAY-1-ABCD" },
    });

    Object.keys(payload).forEach((key) => {
      expect(key).not.toMatch(/card|cvc|expiry|holder|number/i);
    });
    expect(JSON.stringify(payload)).not.toMatch(/4242/);
  });

  it("maps the cart to items and sums the amount", () => {
    const payload = buildCheckoutPayload({
      cartItems: CART,
      address: ADDRESS,
      paymentMethod: PAYMENT_METHODS.COD,
      paymentResult: null,
    });

    expect(payload.items).toEqual([
      { productId: "prod001", price: 19.99, quantity: 2 },
      { productId: "prod003", price: 89.99, quantity: 1 },
    ]);
    expect(payload.amount).toBeCloseTo(129.97, 2);
  });

  it("carries the address and the unchanged defaults", () => {
    const payload = buildCheckoutPayload({
      cartItems: CART,
      address: ADDRESS,
      paymentMethod: PAYMENT_METHODS.COD,
      paymentResult: null,
    });

    expect(payload.country).toBe("Canada");
    expect(payload.city).toBe("Toronto");
    expect(payload.zipcode).toBe("M5V 3A8");
    expect(payload.shippingAddress).toBe("123 Main Street");
    expect(payload.discount).toBe(0);
    expect(payload.status).toBe("pending");
  });

  it("records a cash order as due on delivery with no reference", () => {
    const payload = buildCheckoutPayload({
      cartItems: CART,
      address: ADDRESS,
      paymentMethod: PAYMENT_METHODS.COD,
      paymentResult: { result: "approved", reference: "SIMPAY-1-ABCD" },
    });

    expect(payload.payment_type).toBe("cod");
    expect(payload.payment_status).toBe(PAYMENT_STATUSES.DUE_ON_DELIVERY);
    expect(payload.payment_reference).toBeNull();
  });

  it("records an approved card order as paid with its reference", () => {
    const payload = buildCheckoutPayload({
      cartItems: CART,
      address: ADDRESS,
      paymentMethod: PAYMENT_METHODS.CARD,
      paymentResult: { result: "approved", reference: "SIMPAY-1-ABCD" },
    });

    expect(payload.payment_type).toBe("card");
    expect(payload.payment_status).toBe(PAYMENT_STATUSES.PAID);
    expect(payload.payment_reference).toBe("SIMPAY-1-ABCD");
  });

  it("throws on an empty cart", () => {
    expect(() =>
      buildCheckoutPayload({
        cartItems: [],
        address: ADDRESS,
        paymentMethod: PAYMENT_METHODS.COD,
        paymentResult: null,
      })
    ).toThrow("Cannot check out an empty cart");
  });

  it("throws on an unknown payment method", () => {
    expect(() =>
      buildCheckoutPayload({
        cartItems: CART,
        address: ADDRESS,
        paymentMethod: "bitcoin",
        paymentResult: null,
      })
    ).toThrow("Unknown payment method: bitcoin");
  });
});
