const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  wallet_mock: "Pay with Wallet Mock",
};

const PAYMENT_STATUS_LABELS = {
  pending: "Pending payment",
  paid: "Paid",
  failed: "Payment failed",
};

const FAILURE_REASON_LABELS = {
  cancelled: "The wallet mock was cancelled before confirmation.",
  declined: "The wallet mock simulated a declined payment.",
  timeout: "The wallet mock timed out before confirmation.",
};

export function getPaymentMethodLabel(paymentType) {
  return PAYMENT_METHOD_LABELS[paymentType] || "Unknown payment method";
}

export function getPaymentStatusLabel(paymentStatus) {
  return PAYMENT_STATUS_LABELS[paymentStatus] || "Payment status unavailable";
}

export function getPaymentStatusMessage(order = {}) {
  const paymentType = order?.payment_type;
  const paymentStatus = order?.payment_status;
  const failureReason = order?.payment_failure_reason;

  if (paymentType === "cod") {
    return {
      title: "Payment due on delivery",
      detail: "Cash on Delivery orders stay pending until payment is collected offline.",
    };
  }

  if (paymentType === "wallet_mock" && paymentStatus === "paid") {
    return {
      title: "Mock wallet payment confirmed",
      detail: "This preview wallet flow marked the order as paid without collecting a real charge.",
    };
  }

  if (paymentType === "wallet_mock" && paymentStatus === "failed") {
    return {
      title: "Mock wallet payment failed",
      detail:
        FAILURE_REASON_LABELS[failureReason] ||
        "The wallet mock did not complete, so the order shows a failed payment state.",
    };
  }

  return {
    title: "Payment pending",
    detail: "Payment status will update after the selected payment flow finishes.",
  };
}
