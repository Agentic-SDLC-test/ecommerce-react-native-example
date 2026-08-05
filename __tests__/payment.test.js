/* global describe, it, expect, afterEach */
import {
  MOCK_WALLET_MESSAGE,
  getPaymentMessage,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
  isMockWalletPaymentEnabled,
} from "../utils/payment";

describe("payment helpers", () => {
  const originalEnv = process.env.EXPO_PUBLIC_ENABLE_MOCK_WALLET_PAYMENT;

  afterEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_MOCK_WALLET_PAYMENT = originalEnv;
  });

  it("maps payment labels", () => {
    expect(getPaymentTypeLabel("cod")).toBe("Cash on delivery");
    expect(getPaymentTypeLabel("wallet_mock")).toBe("Wallet mock");
    expect(getPaymentStatusLabel("pending")).toBe("Pending payment");
    expect(getPaymentStatusLabel("paid")).toBe("Paid");
  });

  it("uses order payment messages when present", () => {
    expect(
      getPaymentMessage({
        payment_type: "wallet_mock",
        payment_message: "Mock wallet payment recorded. No live charge was made.",
      })
    ).toBe("Mock wallet payment recorded. No live charge was made.");
    expect(getPaymentMessage({ payment_type: "wallet_mock" })).toBe(MOCK_WALLET_MESSAGE);
  });

  it("reads the mock wallet feature flag from env", () => {
    process.env.EXPO_PUBLIC_ENABLE_MOCK_WALLET_PAYMENT = "true";
    expect(isMockWalletPaymentEnabled()).toBe(true);

    process.env.EXPO_PUBLIC_ENABLE_MOCK_WALLET_PAYMENT = "false";
    expect(isMockWalletPaymentEnabled()).toBe(false);
  });
});
