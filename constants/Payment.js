// Single source of truth for payment method / status enums, display labels,
// status colors, and legacy normalization. Pure functions only — no React,
// no I/O — so they are cheap to unit test and safe to reuse on every read
// surface. Colors are passed in (from constants/Colors.js) rather than
// imported here to keep this module free of styling coupling in tests.

// Payment method the shopper chose at checkout.
export const PAYMENT_TYPES = {
  COD: "cod",
  CARD: "card",
};

// Payment state of an order — distinct from the fulfillment `status`
// (pending → shipped → delivered). `failed` is reserved for a future
// persisted-failure flow; the MVP never persists it.
export const PAYMENT_STATUSES = {
  AWAITING: "awaiting_payment",
  PAID: "paid",
  FAILED: "failed",
};

// One-line rollback flag: set to false to hide the digital option and
// revert checkout to Cash On Delivery only (no data migration needed).
export const DIGITAL_PAYMENT_ENABLED = true;

// Coerce any stored/legacy value to a known payment type. Missing or
// unknown values (including legacy orders that predate this field) fall
// back to Cash On Delivery.
export const normalizePaymentType = (type) =>
  type === PAYMENT_TYPES.CARD ? PAYMENT_TYPES.CARD : PAYMENT_TYPES.COD;

// Coerce any stored/legacy value to a known payment status. `paid` and
// `failed` pass through; everything else (COD, missing, legacy) becomes
// `awaiting_payment`.
export const normalizePaymentStatus = (status) =>
  status === PAYMENT_STATUSES.PAID || status === PAYMENT_STATUSES.FAILED
    ? status
    : PAYMENT_STATUSES.AWAITING;

// Human-readable label for a payment method.
export const getPaymentMethodLabel = (type) =>
  normalizePaymentType(type) === PAYMENT_TYPES.CARD
    ? "Card (Simulated)"
    : "Cash On Delivery";

// Human-readable label for a payment status.
export const getPaymentStatusLabel = (status) => {
  switch (normalizePaymentStatus(status)) {
    case PAYMENT_STATUSES.PAID:
      return "Paid";
    case PAYMENT_STATUSES.FAILED:
      return "Failed";
    default:
      return "Awaiting Payment";
  }
};

// Badge color for a payment status. Colors are injected so this stays
// decoupled from constants/Colors.js and easy to unit test.
export const getPaymentStatusColor = (status, colors) => {
  switch (normalizePaymentStatus(status)) {
    case PAYMENT_STATUSES.PAID:
      return colors.success;
    case PAYMENT_STATUSES.FAILED:
      return colors.danger;
    default:
      return colors.muted;
  }
};
