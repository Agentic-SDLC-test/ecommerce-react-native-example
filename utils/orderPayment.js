const PAYMENT_TYPES = {
  cod: "cod",
  card: "card",
};

const PAYMENT_STATUSES = {
  due_on_delivery: "Due on delivery",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  payment_issue: "Payment issue",
};

function normalizePaymentType(paymentType) {
  return paymentType === PAYMENT_TYPES.card ? PAYMENT_TYPES.card : PAYMENT_TYPES.cod;
}

function derivePaymentStatus(order = {}) {
  if (PAYMENT_STATUSES[order?.payment_status]) {
    return order.payment_status;
  }

  const paymentType = normalizePaymentType(order?.payment_type);
  if (paymentType === PAYMENT_TYPES.cod) {
    return "due_on_delivery";
  }

  if (order?.status === "delivered") {
    return "paid";
  }

  return "awaiting_payment";
}

function getPaymentMethodLabel(paymentType) {
  return normalizePaymentType(paymentType) === PAYMENT_TYPES.card
    ? "Card demo"
    : "Cash on delivery";
}

function getPaymentStatusLabel(paymentStatus) {
  return PAYMENT_STATUSES[paymentStatus] || PAYMENT_STATUSES.due_on_delivery;
}

function getPaymentDisclaimer(order = {}) {
  return normalizePaymentType(order?.payment_type) === PAYMENT_TYPES.card
    ? "Demo payment only - no real card charge was made."
    : null;
}

function canResolveDemoPayment(order = {}) {
  return (
    normalizePaymentType(order?.payment_type) === PAYMENT_TYPES.card &&
    derivePaymentStatus(order) !== "due_on_delivery"
  );
}

module.exports = {
  normalizePaymentType,
  derivePaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentDisclaimer,
  canResolveDemoPayment,
};
