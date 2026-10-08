/**
 * Demo card checks and customer-facing payment labels.
 * Card digits stay on the device; this module does not call the network.
 */
import {
  DEMO_CARD_FAIL_SUFFIX,
  PAYMENT_STATUSES,
  PAYMENT_TYPES,
} from "../constants/Payment";

const CARD_FORMAT_MESSAGE =
  "Enter the demo card name, number, expiry (MM/YY), and CVV. This is an example only and does not charge a real card.";

const CARD_DECLINE_MESSAGE =
  "Card was declined (demo). No order was placed. Try another card or switch to Cash on Delivery.";

const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

export function paymentMethodLabel(paymentType) {
  if (paymentType === PAYMENT_TYPES.CARD) {
    return "Card (demo)";
  }
  return "Cash on Delivery";
}

export function paymentStatusLabel(paymentStatus) {
  if (paymentStatus === PAYMENT_STATUSES.PAID) {
    return "Paid";
  }
  return "Unpaid — collected on delivery";
}

export function displayPayment(order) {
  const source = order || {};
  const paymentType =
    source.payment_type === PAYMENT_TYPES.COD ||
    source.payment_type === PAYMENT_TYPES.CARD
      ? source.payment_type
      : PAYMENT_TYPES.COD;
  const paymentStatus =
    source.payment_status === PAYMENT_STATUSES.PAID ||
    source.payment_status === PAYMENT_STATUSES.UNPAID
      ? source.payment_status
      : PAYMENT_STATUSES.UNPAID;
  return {
    methodLabel: paymentMethodLabel(paymentType),
    statusLabel: paymentStatusLabel(paymentStatus),
  };
}

export function validateDemoCard(fields) {
  const { name, number, expiry, cvv } = fields || {};
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    return { ok: false, message: CARD_FORMAT_MESSAGE };
  }

  const digits = typeof number === "string" ? number.replace(/ /g, "") : "";
  if (!/^\d{16}$/.test(digits)) {
    return { ok: false, message: CARD_FORMAT_MESSAGE };
  }
  if (digits.endsWith(DEMO_CARD_FAIL_SUFFIX)) {
    return { ok: false, message: CARD_DECLINE_MESSAGE };
  }

  if (typeof expiry !== "string" || !EXPIRY_PATTERN.test(expiry)) {
    return { ok: false, message: CARD_FORMAT_MESSAGE };
  }
  if (typeof cvv !== "string" || !/^\d{3}$/.test(cvv)) {
    return { ok: false, message: CARD_FORMAT_MESSAGE };
  }

  return { ok: true, message: "" };
}

export function buildCheckoutPayload(fields) {
  const source = fields || {};
  return {
    items: source.items,
    amount: source.amount,
    discount: source.discount,
    payment_type: source.paymentType,
    country: source.country,
    city: source.city,
    zipcode: source.zipcode,
    shippingAddress: source.shippingAddress,
  };
}
