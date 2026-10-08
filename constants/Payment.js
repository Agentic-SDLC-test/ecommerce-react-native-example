export const ENABLE_DIGITAL_PAYMENT = true;

export const PAYMENT_TYPES = Object.freeze({
  COD: "cod",
  CARD: "card",
});

export const PAYMENT_STATUSES = Object.freeze({
  UNPAID: "unpaid",
  PAID: "paid",
});

export const DEMO_CARD_FAIL_SUFFIX = "0000";

export const FORBIDDEN_CARD_KEYS = Object.freeze([
  "cardNumber",
  "card_number",
  "cvv",
  "cvc",
  "expiry",
  "pan",
  "cardholder",
  "nameOnCard",
]);
