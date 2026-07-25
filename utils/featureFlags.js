function parseBooleanFlag(value, defaultValue = true) {
  if (typeof value === "undefined") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

export function isWalletMockEnabled() {
  return parseBooleanFlag(
    typeof process !== "undefined" && process.env
      ? process.env.EXPO_PUBLIC_ENABLE_WALLET_MOCK
      : undefined
  );
}

export { parseBooleanFlag };
