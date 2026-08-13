export const PAYMENT_METHODS = [
  {
    value: "cod",
    label: "Cash On Delivery",
    description: "Pay when your order arrives.",
    isMockDigital: false,
  },
  {
    value: "mock_wallet",
    label: "Mock Wallet",
    description: "Demo wallet payment. No real money is charged.",
    isMockDigital: true,
  },
];

export const PAYMENT_STATUSES = {
  PENDING_COLLECTION: "pending_collection",
  PAID: "paid",
};

export function getPaymentMethodLabel(paymentType) {
  if (paymentType === "mock_wallet") {
    return "Mock Wallet";
  }
  return "Cash On Delivery";
}

export function getPaymentStatusForMethod(paymentType) {
  if (paymentType === "mock_wallet") {
    return PAYMENT_STATUSES.PAID;
  }
  return PAYMENT_STATUSES.PENDING_COLLECTION;
}

export function getPaymentStatusLabel(paymentStatus, paymentType) {
  if (paymentStatus === PAYMENT_STATUSES.PAID) {
    return "Mock paid";
  }
  return "Pending collection";
}

export function normalizeOrderPayment(order) {
  const paymentType = order?.payment_type || "cod";
  const paymentStatus =
    order?.payment_status || getPaymentStatusForMethod(paymentType);
  const methodLabel = getPaymentMethodLabel(paymentType);
  const statusLabel = getPaymentStatusLabel(paymentStatus, paymentType);
  let note = order?.payment_note || "";

  if (!note) {
    if (paymentType === "mock_wallet") {
      note = "Mock wallet payment. No real funds moved.";
    } else {
      note = "Payment due on delivery.";
    }
  }

  return {
    payment_type: paymentType,
    payment_status: paymentStatus,
    methodLabel,
    statusLabel,
    note,
  };
}
