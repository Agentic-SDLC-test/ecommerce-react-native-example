export const PAYMENT_STATUS_BY_TYPE = {
  cod: "pending_on_delivery",
  mock_wallet: "mock_paid",
};

export function getPaymentStatusForType(paymentType) {
  return PAYMENT_STATUS_BY_TYPE[paymentType] || "pending_on_delivery";
}

export function formatPaymentMethod(paymentType) {
  if (paymentType === "mock_wallet") {
    return "Mock Wallet Payment";
  }
  return "Cash On Delivery";
}

export function formatPaymentStatus(paymentStatus, paymentType) {
  if (paymentStatus === "mock_paid") {
    return "Mock payment completed";
  }
  if (paymentStatus === "pending_on_delivery") {
    return "Payment pending on delivery";
  }
  if (paymentType === "mock_wallet") {
    return "Mock payment completed";
  }
  return "Payment pending on delivery";
}
