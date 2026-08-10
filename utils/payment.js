export const PAYMENT_METHODS = {
  COD: "cod",
  MOCK_WALLET: "mock_wallet",
};

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  AWAITING_ACTION: "awaiting_action",
};

export const PAYMENT_OPTIONS = [
  {
    label: "Cash on Delivery",
    value: PAYMENT_METHODS.COD,
    description: "Pay when your order arrives at your delivery address.",
    defaultStatus: PAYMENT_STATUSES.PENDING,
  },
  {
    label: "Mock Wallet",
    value: PAYMENT_METHODS.MOCK_WALLET,
    description: "Demo payment only. No real money will be processed.",
    defaultStatus: PAYMENT_STATUSES.PAID,
  },
];

export const getPaymentMethodLabel = (paymentType) => {
  switch (paymentType) {
    case PAYMENT_METHODS.COD:
      return "Cash on Delivery";
    case PAYMENT_METHODS.MOCK_WALLET:
      return "Mock Wallet";
    default:
      return "Unknown payment method";
  }
};

export const getPaymentStatusLabel = (paymentStatus, paymentType) => {
  if (!paymentStatus && paymentType === PAYMENT_METHODS.COD) {
    return "Payment due on delivery";
  }

  switch (paymentStatus) {
    case PAYMENT_STATUSES.PENDING:
      return "Payment due on delivery";
    case PAYMENT_STATUSES.PAID:
      return paymentType === PAYMENT_METHODS.MOCK_WALLET
        ? "Paid with mock wallet"
        : "Paid";
    case PAYMENT_STATUSES.FAILED:
      return "Payment failed";
    case PAYMENT_STATUSES.AWAITING_ACTION:
      return "Awaiting payment action";
    default:
      return "Unknown payment status";
  }
};

export const getDefaultPaymentStatus = (paymentType) => {
  if (paymentType === PAYMENT_METHODS.MOCK_WALLET) {
    return PAYMENT_STATUSES.PAID;
  }

  return PAYMENT_STATUSES.PENDING;
};

export const isSupportedPaymentMethod = (paymentType) =>
  PAYMENT_OPTIONS.some((option) => option.value === paymentType);
