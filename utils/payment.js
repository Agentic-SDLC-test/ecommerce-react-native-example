const PAYMENT_TYPE_LABELS = {
  cod: "Cash on delivery",
  wallet_mock: "Wallet mock",
};

const PAYMENT_STATUS_LABELS = {
  pending: "Pending payment",
  paid: "Paid",
  failed: "Payment failed",
};

const MOCK_WALLET_MESSAGE = "Demo payment only. No card or wallet will be charged.";

export function getPaymentTypeLabel(paymentType) {
  return PAYMENT_TYPE_LABELS[paymentType] || "Unknown payment method";
}

export function getPaymentStatusLabel(paymentStatus) {
  return PAYMENT_STATUS_LABELS[paymentStatus] || "Payment status unavailable";
}

export function isWalletMock(paymentType) {
  return paymentType === "wallet_mock";
}

export function getPaymentMessage(order) {
  if (order?.payment_message) {
    return order.payment_message;
  }

  return isWalletMock(order?.payment_type) ? MOCK_WALLET_MESSAGE : "Pay on delivery";
}

export function isMockWalletPaymentEnabled() {
  return (
    String(process.env?.EXPO_PUBLIC_ENABLE_MOCK_WALLET_PAYMENT || "").toLowerCase() ===
    "true"
  );
}

export { MOCK_WALLET_MESSAGE };
