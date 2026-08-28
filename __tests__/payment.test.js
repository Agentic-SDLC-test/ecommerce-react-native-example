import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  methodLabel,
  statusLabel,
  resolvePaymentStatus,
  runMockPayment,
} from "../utils/payment";

describe("Payment utilities", () => {
  describe("methodLabel", () => {
    it("maps known methods to human-readable labels", () => {
      expect(methodLabel(PAYMENT_METHOD.COD)).toBe("Cash on Delivery");
      expect(methodLabel(PAYMENT_METHOD.CARD)).toBe("Card");
      expect(methodLabel(PAYMENT_METHOD.WALLET)).toBe("Wallet");
    });

    it("passes unknown values through unchanged", () => {
      expect(methodLabel("crypto")).toBe("crypto");
    });
  });

  describe("statusLabel", () => {
    it("maps known statuses to human-readable labels", () => {
      expect(statusLabel(PAYMENT_STATUS.COD_PENDING)).toBe("Collected on Delivery");
      expect(statusLabel(PAYMENT_STATUS.AWAITING)).toBe("Awaiting Payment");
      expect(statusLabel(PAYMENT_STATUS.PAID)).toBe("Paid");
      expect(statusLabel(PAYMENT_STATUS.FAILED)).toBe("Payment Failed");
    });

    it("passes unknown values through unchanged", () => {
      expect(statusLabel("refunded")).toBe("refunded");
    });
  });

  describe("resolvePaymentStatus", () => {
    it("returns the stored payment_status when present", () => {
      expect(resolvePaymentStatus({ payment_status: PAYMENT_STATUS.PAID })).toBe(
        PAYMENT_STATUS.PAID
      );
    });

    it("defaults legacy orders without a payment_status to cod_pending", () => {
      expect(resolvePaymentStatus({ payment_type: "cod" })).toBe(
        PAYMENT_STATUS.COD_PENDING
      );
    });

    it("never throws on null/undefined input", () => {
      expect(resolvePaymentStatus(null)).toBe(PAYMENT_STATUS.COD_PENDING);
      expect(resolvePaymentStatus(undefined)).toBe(PAYMENT_STATUS.COD_PENDING);
    });
  });

  describe("runMockPayment", () => {
    it("succeeds for card when a numeric card number is entered", async () => {
      const result = await runMockPayment(PAYMENT_METHOD.CARD, {
        cardNumber: "4111111111111111",
      });
      expect(result.success).toBe(true);
      expect(result.reference).toBeDefined();
    });

    it("fails for card when the card number is empty", async () => {
      const result = await runMockPayment(PAYMENT_METHOD.CARD, { cardNumber: "" });
      expect(result.success).toBe(false);
    });

    it("fails for card when the card number is not numeric", async () => {
      const result = await runMockPayment(PAYMENT_METHOD.CARD, {
        cardNumber: "abcd",
      });
      expect(result.success).toBe(false);
    });

    it("always succeeds for wallet on confirm", async () => {
      const result = await runMockPayment(PAYMENT_METHOD.WALLET, {});
      expect(result.success).toBe(true);
    });

    it("never returns card data on the result", async () => {
      const result = await runMockPayment(PAYMENT_METHOD.CARD, {
        cardNumber: "4111111111111111",
      });
      expect(JSON.stringify(result)).not.toContain("4111111111111111");
    });
  });
});
