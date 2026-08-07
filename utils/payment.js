export const PAYMENT_METHODS = {
  COD: "cod",
  MOCK_WALLET: "mock_wallet",
};

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  UNKNOWN: "unknown",
};

export const PAYMENT_OPTIONS = [
  {
    value: PAYMENT_METHODS.COD,
    label: "Cash on Delivery",
    description: "Pay when your package arrives.",
    statusOnCheckout: PAYMENT_STATUSES.PENDING,
  },
  {
    value: PAYMENT_METHODS.MOCK_WALLET,
    label: "Mock Wallet",
    description:
      "Demo payment - no real wallet credentials required. Marked paid after order placement.",
    statusOnCheckout: PAYMENT_STATUSES.PAID,
  },
];

export const getPaymentMethodLabel = (paymentType) => {
  if (paymentType === PAYMENT_METHODS.COD) {
    return "Cash on Delivery";
  }
  if (paymentType === PAYMENT_METHODS.MOCK_WALLET) {
    return "Mock Wallet";
  }
  return "Unknown payment method";
};

export const getPaymentStatusLabel = (paymentStatus) => {
  if (paymentStatus === PAYMENT_STATUSES.PENDING) {
    return "Payment pending";
  }
  if (paymentStatus === PAYMENT_STATUSES.PAID) {
    return "Paid";
  }
  if (paymentStatus === PAYMENT_STATUSES.FAILED) {
    return "Payment failed";
  }
  return "Payment status unavailable";
};

export const getPaymentStatusDescription = (paymentType, paymentStatus) => {
  if (paymentType === PAYMENT_METHODS.COD && paymentStatus === PAYMENT_STATUSES.PENDING) {
    return "Payment will be collected when your package arrives.";
  }
  if (paymentType === PAYMENT_METHODS.MOCK_WALLET && paymentStatus === PAYMENT_STATUSES.PAID) {
    return "Your demo wallet payment is complete and no further payment action is needed.";
  }
  if (paymentStatus === PAYMENT_STATUSES.FAILED) {
    return "Payment could not be completed. Please contact support for next steps.";
  }
  return "Payment status is unavailable for this order.";
};

export const getCheckoutPaymentStatus = (paymentType) => {
  if (paymentType === PAYMENT_METHODS.MOCK_WALLET) {
    return PAYMENT_STATUSES.PAID;
  }
  if (paymentType === PAYMENT_METHODS.COD) {
    return PAYMENT_STATUSES.PENDING;
  }
  return PAYMENT_STATUSES.UNKNOWN;
};

export const normalizePaymentStatus = (order = {}) => {
  if (order.payment_status) {
    return order.payment_status;
  }
  if (order.payment_type === PAYMENT_METHODS.COD) {
    return PAYMENT_STATUSES.PENDING;
  }
  return PAYMENT_STATUSES.UNKNOWN;
};
