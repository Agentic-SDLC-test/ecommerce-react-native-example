import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
} from "../constants/payments";

// Pure helpers for payment vocabulary and state derivation. Mirrors the
// pure-function style of utils/reviewHelper.js and is unit-tested the same way.

// Returns the display label for a method key; unknown / legacy keys fall back
// to Cash on Delivery so older orders render safely (BR-7).
export const getPaymentMethodLabel = (methodKey) => {
  const method = PAYMENT_METHODS.find((m) => m.key === methodKey);
  return method ? method.label : "Cash on Delivery";
};

// True when the method's `digital` flag is set (drives the simulated step).
export const isDigitalMethod = (methodKey) => {
  const method = PAYMENT_METHODS.find((m) => m.key === methodKey);
  return method ? method.digital : false;
};

// Maps a payment status enum to display copy. A missing / unknown status is
// treated as COD-safe: COD reads as pay-on-arrival, anything else as awaiting
// payment (backward compatibility for orders created before this change, BR-7).
export const getPaymentStatusLabel = (status, methodKey) => {
  if (PAYMENT_STATUS_LABELS[status]) {
    return PAYMENT_STATUS_LABELS[status];
  }
  if (methodKey === "cod") {
    return "Cash on delivery — pay on arrival";
  }
  return "Awaiting payment";
};

// Derives the payment status from the chosen method and simulated outcome:
// COD is always awaiting payment; a digital method is paid on success and
// failed otherwise.
export const resolvePaymentStatus = (methodKey, { success } = {}) => {
  if (!isDigitalMethod(methodKey)) {
    return PAYMENT_STATUS.AWAITING;
  }
  return success ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;
};
