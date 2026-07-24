export function isReviewsEnabled() {
  return String(process?.env?.EXPO_PUBLIC_ENABLE_REVIEWS || "").toLowerCase() === "true";
}
