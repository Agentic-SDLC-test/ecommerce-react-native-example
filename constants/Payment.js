// The single source of the payment vocabulary. Every shopper-facing payment
// string lives here so checkout, confirmation, order history and the staff
// views cannot drift apart.
//
// The mock-server keeps its own CommonJS copy of the two enums
// (mock-server/payment.js) because the Expo bundle must not import server
// files. __tests__/mockServerPayment.test.js asserts the two stay identical.

export const PAYMENT_METHODS = Object.freeze({
  COD: "cod",
  CARD: "card",
});

// Payment state is deliberately separate from the fulfilment `status` field
// (pending / shipped / delivered) — advancing one must never move the other.
export const PAYMENT_STATUSES = Object.freeze({
  DUE_ON_DELIVERY: "due_on_delivery",
  PAID: "paid",
  FAILED: "failed",
  NOT_COMPLETED: "not_completed",
});

export const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  card: "Card (simulated)",
};

export const PAYMENT_METHOD_HINTS = {
  cod: "Pay cash when your order arrives",
  card: "Enter simulated card details on the next screen",
};

// Ionicons names.
export const PAYMENT_METHOD_ICONS = {
  cod: "cash-outline",
  card: "card-outline",
};

export const PAYMENT_STATUS_LABELS = {
  due_on_delivery: "Pay on delivery",
  paid: "Paid",
  failed: "Payment failed",
  not_completed: "Payment not completed",
};

export const PAYMENT_CONFIRMATION_TEXT = {
  cod: "Pay cash when your order arrives",
  card_paid: "Paid by card",
  card_pending: "Payment not completed",
};

// COD is first so the list reads as "cash on delivery is the default".
export const PAYMENT_METHOD_OPTIONS = [
  {
    value: PAYMENT_METHODS.COD,
    label: PAYMENT_METHOD_LABELS.cod,
    hint: PAYMENT_METHOD_HINTS.cod,
    icon: PAYMENT_METHOD_ICONS.cod,
  },
  {
    value: PAYMENT_METHODS.CARD,
    label: PAYMENT_METHOD_LABELS.card,
    hint: PAYMENT_METHOD_HINTS.card,
    icon: PAYMENT_METHOD_ICONS.card,
  },
];

export const SIMULATION_NOTICE =
  "Simulated payment — no real money moves and no card details are stored.";

const payment = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_HINTS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_CONFIRMATION_TEXT,
  PAYMENT_METHOD_OPTIONS,
  SIMULATION_NOTICE,
};

export default payment;
