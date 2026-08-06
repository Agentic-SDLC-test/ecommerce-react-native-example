// Payment vocabulary, read-time defaults and write-time invariants for the
// mock-server. Kept free of express so jest can require it even though
// /mock-server/ is excluded from test discovery.
//
// These two enums must stay identical to constants/Payment.js in the app bundle
// (the app cannot import server files). __tests__/mockServerPayment.test.js
// requires both and fails on drift.

const PAYMENT_METHODS = {
  COD: "cod",
  CARD: "card",
};

const PAYMENT_STATUSES = {
  DUE_ON_DELIVERY: "due_on_delivery",
  PAID: "paid",
  FAILED: "failed",
  NOT_COMPLETED: "not_completed",
};

const KNOWN_METHODS = Object.values(PAYMENT_METHODS);
const KNOWN_STATUSES = Object.values(PAYMENT_STATUSES);

// Applied at read time so a row that predates the payment fields is never
// returned as undefined — and is never upgraded to paid.
function withPaymentDefaults(order) {
  const known = KNOWN_STATUSES.includes(order.payment_status);
  return {
    ...order,
    payment_type: order.payment_type || PAYMENT_METHODS.COD,
    payment_status: known ? order.payment_status : PAYMENT_STATUSES.DUE_ON_DELIVERY,
    payment_reference: order.payment_reference || null,
    payment_status_updated_at: order.payment_status_updated_at || order.createdAt || null,
  };
}

// Rejects contradictory combinations at the boundary so no invalid row can enter
// the store in the first place.
function validatePaymentFields({ payment_type, payment_status, payment_reference }) {
  if (!KNOWN_METHODS.includes(payment_type)) {
    return { valid: false, message: "Invalid payment_type" };
  }
  if (!KNOWN_STATUSES.includes(payment_status)) {
    return { valid: false, message: "Invalid payment_status" };
  }
  if (
    payment_type === PAYMENT_METHODS.COD &&
    payment_status !== PAYMENT_STATUSES.DUE_ON_DELIVERY
  ) {
    return {
      valid: false,
      message: "Cash on delivery orders cannot be recorded as paid",
    };
  }
  if (
    payment_type === PAYMENT_METHODS.CARD &&
    payment_status === PAYMENT_STATUSES.PAID &&
    !payment_reference
  ) {
    return {
      valid: false,
      message: "A paid card order requires a payment_reference",
    };
  }
  return { valid: true, message: "" };
}

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  withPaymentDefaults,
  validatePaymentFields,
};
