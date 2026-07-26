import colors from "./Colors";

export const PAYMENT_METHODS = {
  COD: "cod",
  WALLET: "wallet",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: "Cash On Delivery",
  [PAYMENT_METHODS.WALLET]: "Mock Wallet",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

export const PAYMENT_STATUS_COLORS = {
  pending: colors.warning,
  paid: colors.success,
  failed: colors.danger,
};

export const isWalletPayment = (paymentType) =>
  paymentType === PAYMENT_METHODS.WALLET;

export const getEffectivePaymentStatus = (order = {}) => {
  if (PAYMENT_STATUS_LABELS[order.payment_status]) {
    return order.payment_status;
  }

  const paymentType = order.payment_type || PAYMENT_METHODS.COD;
  if (paymentType === PAYMENT_METHODS.COD && order.status === "delivered") {
    return "paid";
  }

  return "pending";
};
