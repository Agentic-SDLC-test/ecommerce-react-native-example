export const DIGITAL_PAYMENT_ENABLED = true;

const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  wallet_mock: "Pay with Wallet (Mock)",
};

const PAYMENT_STATUS_LABELS = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
};

const PAYMENT_MESSAGES = {
  cod: {
    awaiting_payment: "Pay when the order arrives",
  },
  wallet_mock: {
    awaiting_payment: "Mock wallet payment is still awaiting completion",
    paid: "Mock wallet payment completed successfully",
    failed: "Mock wallet payment failed; order is still unpaid",
  },
};

export function getPaymentMethodOptions() {
  const options = [{ label: PAYMENT_METHOD_LABELS.cod, value: "cod" }];

  if (DIGITAL_PAYMENT_ENABLED) {
    options.push({
      label: PAYMENT_METHOD_LABELS.wallet_mock,
      value: "wallet_mock",
    });
  }

  return options;
}

export function getMockOutcomeOptions() {
  return [
    { label: PAYMENT_STATUS_LABELS.paid, value: "paid" },
    {
      label: PAYMENT_STATUS_LABELS.awaiting_payment,
      value: "awaiting_payment",
    },
    { label: PAYMENT_STATUS_LABELS.failed, value: "failed" },
  ];
}

export function normalizePaymentStatus(paymentType, paymentStatus) {
  if (paymentType === "cod") {
    return "awaiting_payment";
  }

  if (paymentType !== "wallet_mock") {
    throw new Error("Unsupported payment type");
  }

  const supportedStatuses = getMockOutcomeOptions().map((option) => option.value);
  if (!supportedStatuses.includes(paymentStatus)) {
    throw new Error("Unsupported payment status");
  }

  return paymentStatus;
}

export function formatPaymentMethod(paymentType) {
  if (!PAYMENT_METHOD_LABELS[paymentType]) {
    throw new Error("Unsupported payment type");
  }

  return PAYMENT_METHOD_LABELS[paymentType];
}

export function formatPaymentStatus(paymentType, paymentStatus) {
  const normalizedStatus = normalizePaymentStatus(paymentType, paymentStatus);
  return PAYMENT_STATUS_LABELS[normalizedStatus];
}

export function getPaymentMessage(paymentType, paymentStatus) {
  const normalizedStatus = normalizePaymentStatus(paymentType, paymentStatus);
  const message = PAYMENT_MESSAGES[paymentType]?.[normalizedStatus];

  if (!message) {
    throw new Error("Unsupported payment message");
  }

  return message;
}
