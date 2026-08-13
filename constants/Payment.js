export const ENABLE_DIGITAL_PAYMENT = true;

export const PAYMENT_TYPES = {
  COD: "cod",
  CARD: "card",
};

export const PAYMENT_STATUSES = {
  COD_PENDING: "cod_pending",
  PAID: "paid",
  PENDING: "pending",
  FAILED: "failed",
};

export const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  card: "Card (Demo)",
};

export const PAYMENT_STATUS_LABELS = {
  cod_pending: "Pay on delivery",
  paid: "Paid",
  pending: "Payment pending",
  failed: "Payment failed",
};

/** Card numbers ending with this suffix simulate local demo failure. */
export const DEMO_CARD_FAIL_SUFFIX = "0000";

export const getPaymentMethodLabel = (type) => {
  if (type && PAYMENT_METHOD_LABELS[type]) {
    return PAYMENT_METHOD_LABELS[type];
  }
  return type ? String(type) : "Unknown";
};

export const getPaymentStatusLabel = (status) => {
  if (status && PAYMENT_STATUS_LABELS[status]) {
    return PAYMENT_STATUS_LABELS[status];
  }
  return status ? String(status) : "Unknown";
};

/**
 * Resolve a display payment status when older orders omit payment_status.
 */
export const resolvePaymentStatus = (order) => {
  if (!order) {
    return PAYMENT_STATUSES.PENDING;
  }
  if (order.payment_status) {
    return order.payment_status;
  }
  if (order.payment_type === PAYMENT_TYPES.COD) {
    return PAYMENT_STATUSES.COD_PENDING;
  }
  return PAYMENT_STATUSES.PENDING;
};
