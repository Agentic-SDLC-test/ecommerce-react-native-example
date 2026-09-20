// Single source of truth for payment method + status vocabulary.
// Every checkout / confirmation / history surface reads its copy from here
// (via utils/payment.js) so the same order reads identically everywhere.

// Selectable payment methods. `digital: true` triggers the simulated payment
// step. Add a wallet / redirect path here later without touching CheckoutScreen.
export const PAYMENT_METHODS = [
  { key: "cod", label: "Cash on Delivery", digital: false },
  { key: "card", label: "Card (Placeholder)", digital: true },
];

// Payment state of an order, kept separate from the fulfillment `status`.
export const PAYMENT_STATUS = {
  AWAITING: "awaiting_payment",
  PAID: "paid",
  FAILED: "failed",
};

export const PAYMENT_STATUS_LABELS = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
};

// COD is preselected so a method is always chosen and the order can be submitted.
export const DEFAULT_METHOD = "cod";
