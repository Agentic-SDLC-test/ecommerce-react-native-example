export const PAYMENT_METHODS = [
  { code: "cod", label: "Cash on Delivery", subtitle: "Pay when your order arrives" },
  { code: "wallet", label: "Pay with Wallet", subtitle: "Mock digital payment" },
];

export const PAYMENT_STATUSES = {
  PAY_ON_DELIVERY: "pay_on_delivery",
  PAID: "paid",
};

export const DEFAULT_PAYMENT_METHOD = "cod";

export const getPaymentMethodLabel = (code) => {
  const method = PAYMENT_METHODS.find((m) => m.code === code);
  return method ? method.label : "Unknown";
};

export const getPaymentStatusLabel = (code) => {
  if (code === PAYMENT_STATUSES.PAY_ON_DELIVERY) {
    return "Pay on delivery";
  }
  if (code === PAYMENT_STATUSES.PAID) {
    return "Paid";
  }
  return "—";
};
