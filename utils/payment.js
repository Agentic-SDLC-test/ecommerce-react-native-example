// Single source of truth for payment method / status enums, their display
// labels, backward-compatible resolution for legacy orders, and the
// client-side mock-payment simulator. Pure module: no UI or network deps, so
// screens import from here instead of inlining payment string literals.
//
// This iteration's digital path is a *simulated* experience (no real money
// movement). runMockPayment isolates that simulation behind one async function
// — the seam a future real gateway would replace without touching screens.

// Optional kill switch: when false, checkout offers COD only. Default on.
export const PAYMENT_DIGITAL_ENABLED = true;

// Customer-selectable payment method. `payment_type` already exists on every
// order/seed; this widens its allowed values from effectively "cod" to these.
export const PAYMENT_METHOD = {
  COD: "cod",
  CARD: "card",
  WALLET: "wallet",
};

// Payment state, tracked separately from the fulfillment `status`
// (pending/shipped/delivered) so the two never collide. Persisted values this
// iteration are COD_PENDING and PAID; AWAITING and FAILED are transient
// client-only states (never checked out) reserved for a future real gateway.
export const PAYMENT_STATUS = {
  COD_PENDING: "cod_pending",
  AWAITING: "awaiting_payment",
  PAID: "paid",
  FAILED: "failed",
};

const METHOD_LABELS = {
  [PAYMENT_METHOD.COD]: "Cash on Delivery",
  [PAYMENT_METHOD.CARD]: "Card",
  [PAYMENT_METHOD.WALLET]: "Wallet",
};

const STATUS_LABELS = {
  [PAYMENT_STATUS.COD_PENDING]: "Collected on Delivery",
  [PAYMENT_STATUS.AWAITING]: "Awaiting Payment",
  [PAYMENT_STATUS.PAID]: "Paid",
  [PAYMENT_STATUS.FAILED]: "Payment Failed",
};

// Human-readable label for a payment method; unknown values pass through.
export const methodLabel = (value) => METHOD_LABELS[value] || value;

// Human-readable label for a payment status; unknown values pass through.
export const statusLabel = (value) => STATUS_LABELS[value] || value;

// Backward-compatible payment status for an order. Legacy orders placed before
// this feature carry no payment_status, so default them to COD_PENDING
// (collected on delivery). Never throws.
export const resolvePaymentStatus = (order) => {
  if (order && order.payment_status) {
    return order.payment_status;
  }
  return PAYMENT_STATUS.COD_PENDING;
};

// Simulate a digital payment for the chosen method. Resolves after a short
// simulated delay to a definite outcome.
//   - card:   succeeds only when a non-empty numeric card number is entered.
//   - wallet: always succeeds on confirm.
// Returns a synthetic reference on success. Stores/logs nothing sensitive: the
// card form is used only to decide the outcome and is never persisted.
export const runMockPayment = (method, form = {}) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (method === PAYMENT_METHOD.WALLET) {
        resolve({ success: true, reference: `WAL-${form.token || "mock"}` });
        return;
      }
      if (method === PAYMENT_METHOD.CARD) {
        // Validate the mock card number only to decide the outcome; no card
        // data is retained in the result (BR-10).
        const digits = String(form.cardNumber || "").replace(/\s/g, "");
        const valid = digits.length > 0 && /^\d+$/.test(digits);
        resolve(valid ? { success: true, reference: "CARD-MOCK" } : { success: false });
        return;
      }
      resolve({ success: false });
    }, 800);
  });
