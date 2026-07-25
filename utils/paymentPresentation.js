const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  wallet: "Pay with Wallet",
};

const PAYMENT_STATUS_LABELS = {
  pay_on_delivery: "Pay on delivery",
  pending: "Pending payment",
  paid: "Paid",
  failed: "Payment failed",
  cancelled: "Payment cancelled",
};

const PAYMENT_STATUS_TONES = {
  pay_on_delivery: "muted",
  pending: "warning",
  paid: "success",
  failed: "danger",
  cancelled: "danger",
};

export function getEffectivePaymentStatus(paymentStatus, paymentType) {
  if (paymentStatus) {
    return paymentStatus;
  }

  if (paymentType === "cod") {
    return "pay_on_delivery";
  }

  return "pending";
}

export function getPaymentMethodLabel(paymentType) {
  return PAYMENT_METHOD_LABELS[paymentType] || "Payment";
}

export function getPaymentStatusLabel(paymentStatus, paymentType) {
  const normalizedStatus = getEffectivePaymentStatus(paymentStatus, paymentType);
  return PAYMENT_STATUS_LABELS[normalizedStatus] || PAYMENT_STATUS_LABELS.pending;
}

export function getPaymentStatusTone(paymentStatus, paymentType) {
  const normalizedStatus = getEffectivePaymentStatus(paymentStatus, paymentType);
  return PAYMENT_STATUS_TONES[normalizedStatus] || "warning";
}

export function canResumeWalletPayment(order) {
  if (!order || order.payment_type !== "wallet") {
    return false;
  }

  const normalizedStatus = getEffectivePaymentStatus(
    order.payment_status,
    order.payment_type
  );

  return ["pending", "failed", "cancelled"].includes(normalizedStatus);
}
