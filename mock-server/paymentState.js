const PAYMENT_TYPES = {
  COD: "cod",
  WALLET: "wallet",
};

const PAYMENT_STATUSES = {
  PAY_ON_DELIVERY: "pay_on_delivery",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.PAY_ON_DELIVERY]: "Pay on delivery",
  [PAYMENT_STATUSES.PENDING]: "Pending payment",
  [PAYMENT_STATUSES.PAID]: "Paid",
  [PAYMENT_STATUSES.FAILED]: "Payment failed",
  [PAYMENT_STATUSES.CANCELLED]: "Payment cancelled",
};

const SUPPORTED_PAYMENT_TYPES = Object.values(PAYMENT_TYPES);
const SUPPORTED_PAYMENT_STATUS_UPDATES = [
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.PAID,
  PAYMENT_STATUSES.FAILED,
  PAYMENT_STATUSES.CANCELLED,
];

function getInitialPaymentStatus(paymentType) {
  if (paymentType === PAYMENT_TYPES.COD) {
    return PAYMENT_STATUSES.PAY_ON_DELIVERY;
  }

  if (paymentType === PAYMENT_TYPES.WALLET) {
    return PAYMENT_STATUSES.PENDING;
  }

  throw new Error("Invalid payment type");
}

function getPaymentStatusLabel(paymentStatus) {
  return PAYMENT_STATUS_LABELS[paymentStatus] || PAYMENT_STATUS_LABELS[PAYMENT_STATUSES.PENDING];
}

function canTransitionPaymentStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (
    !SUPPORTED_PAYMENT_STATUS_UPDATES.includes(currentStatus) ||
    !SUPPORTED_PAYMENT_STATUS_UPDATES.includes(nextStatus)
  ) {
    return false;
  }

  if (currentStatus === PAYMENT_STATUSES.PAID) {
    return false;
  }

  if (currentStatus === PAYMENT_STATUSES.PENDING) {
    return [
      PAYMENT_STATUSES.PAID,
      PAYMENT_STATUSES.FAILED,
      PAYMENT_STATUSES.CANCELLED,
    ].includes(nextStatus);
  }

  return nextStatus === PAYMENT_STATUSES.PENDING;
}

function canAdvanceFulfillment(order, nextFulfillmentStatus) {
  if (!order || !nextFulfillmentStatus) {
    return false;
  }

  if (order.payment_type !== PAYMENT_TYPES.WALLET) {
    return true;
  }

  if (!["shipped", "delivered"].includes(nextFulfillmentStatus)) {
    return true;
  }

  return order.payment_status === PAYMENT_STATUSES.PAID;
}

function normalizeOrderPaymentFields(order) {
  const paymentType = order.payment_type || PAYMENT_TYPES.COD;
  const paymentStatus = order.payment_status || getInitialPaymentStatus(paymentType);

  return {
    ...order,
    payment_type: paymentType,
    payment_status: paymentStatus,
    payment_updated_at:
      order.payment_updated_at || order.updatedAt || order.createdAt || new Date().toISOString(),
    ...(order.payment_failure_reason
      ? { payment_failure_reason: order.payment_failure_reason }
      : {}),
  };
}

module.exports = {
  PAYMENT_TYPES,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  SUPPORTED_PAYMENT_TYPES,
  SUPPORTED_PAYMENT_STATUS_UPDATES,
  getInitialPaymentStatus,
  getPaymentStatusLabel,
  canTransitionPaymentStatus,
  canAdvanceFulfillment,
  normalizeOrderPaymentFields,
};
