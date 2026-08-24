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

/**
 * Local demo-card validation (fail-closed). Never sends card secrets to the API.
 * @param {{ cardNumber?: string, cardExpiry?: string, cardCvv?: string }} fields
 * @returns {{ ok: boolean, message?: string }}
 */
export const validateDemoCard = ({ cardNumber, cardExpiry, cardCvv }) => {
  const numberDigits = String(cardNumber ?? "").replace(/\D/g, "");
  const expiry = String(cardExpiry ?? "").trim();
  const cvv = String(cardCvv ?? "").trim();
  if (!numberDigits || !expiry || !cvv) {
    return { ok: false, message: "Enter demo card number, expiry, and CVV." };
  }
  if (numberDigits.length < 12) {
    return { ok: false, message: "Demo card number must be at least 12 digits." };
  }
  if (numberDigits.endsWith(DEMO_CARD_FAIL_SUFFIX)) {
    return {
      ok: false,
      message:
        "Demo card payment failed. Try another test card (do not end with 0000).",
    };
  }
  return { ok: true };
};
