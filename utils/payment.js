export const PAYMENT_METHODS = {
  COD: "cod",
  MOCK_WALLET: "mock_wallet",
};

export const PAYMENT_STATUSES = {
  DUE_ON_DELIVERY: "due_on_delivery",
  PAID: "paid",
};

export function getPaymentStatusForMethod(paymentType) {
  if (paymentType === PAYMENT_METHODS.MOCK_WALLET) {
    return PAYMENT_STATUSES.PAID;
  }
  return PAYMENT_STATUSES.DUE_ON_DELIVERY;
}

export function formatPaymentMethod(paymentType) {
  if (paymentType === PAYMENT_METHODS.MOCK_WALLET) {
    return "Mock Wallet";
  }
  return "Cash On Delivery";
}

export function formatPaymentStatus(paymentStatus, paymentType) {
  if (
    paymentStatus === PAYMENT_STATUSES.PAID ||
    paymentType === PAYMENT_METHODS.MOCK_WALLET
  ) {
    return "Paid";
  }
  return "Payment due on delivery";
}

export function normalizeOrderPayment(order) {
  const paymentType = order?.payment_type || PAYMENT_METHODS.COD;
  const paymentStatus =
    order?.payment_status || getPaymentStatusForMethod(paymentType);
  return {
    ...order,
    payment_type: paymentType,
    payment_status: paymentStatus,
  };
}
