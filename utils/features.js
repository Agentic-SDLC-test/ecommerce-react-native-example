export function isReviewsEnabled() {
  return String(process?.env?.EXPO_PUBLIC_ENABLE_REVIEWS || "").toLowerCase() === "true";
}

export function isWalletPaymentsEnabled() {
  return String(process?.env?.EXPO_PUBLIC_ENABLE_WALLET_PAYMENTS || "").toLowerCase() === "true";
}
