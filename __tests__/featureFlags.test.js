/* global afterEach, describe, it, expect */

import { isWalletMockEnabled, parseBooleanFlag } from "../utils/featureFlags";

describe("wallet mock feature flag", () => {
  const originalValue = process.env.EXPO_PUBLIC_ENABLE_WALLET_MOCK;

  afterEach(() => {
    if (typeof originalValue === "undefined") {
      delete process.env.EXPO_PUBLIC_ENABLE_WALLET_MOCK;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_WALLET_MOCK = originalValue;
    }
  });

  it("defaults to enabled when unset", () => {
    delete process.env.EXPO_PUBLIC_ENABLE_WALLET_MOCK;
    expect(isWalletMockEnabled()).toBe(true);
  });

  it("parses explicit false values", () => {
    process.env.EXPO_PUBLIC_ENABLE_WALLET_MOCK = "false";
    expect(isWalletMockEnabled()).toBe(false);
    expect(parseBooleanFlag("no")).toBe(false);
  });
});
