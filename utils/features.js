function isEnabled(value) {
  return String(value || "").toLowerCase() === "true";
}

export function isReviewsEnabled() {
  return isEnabled(process?.env?.EXPO_PUBLIC_ENABLE_REVIEWS);
}

export function isDigitalPaymentPlaceholderEnabled() {
  return isEnabled(process?.env?.EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT_PLACEHOLDER);
}
