import {
  getPaymentMethodLabel,
  isDigitalMethod,
  getPaymentStatusLabel,
  resolvePaymentStatus,
} from "../utils/payment";
import { PAYMENT_STATUS } from "../constants/payments";

describe("Payment helper utilities", () => {
  describe("getPaymentMethodLabel", () => {
    it("returns the label for known methods", () => {
      expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
      expect(getPaymentMethodLabel("card")).toBe("Card (Placeholder)");
    });

    it("falls back to Cash on Delivery for unknown or legacy keys", () => {
      expect(getPaymentMethodLabel("wallet")).toBe("Cash on Delivery");
      expect(getPaymentMethodLabel(undefined)).toBe("Cash on Delivery");
    });
  });

  describe("isDigitalMethod", () => {
    it("is false for COD and true for card", () => {
      expect(isDigitalMethod("cod")).toBe(false);
      expect(isDigitalMethod("card")).toBe(true);
    });

    it("is false for unknown or missing keys", () => {
      expect(isDigitalMethod("wallet")).toBe(false);
      expect(isDigitalMethod(undefined)).toBe(false);
    });
  });

  describe("getPaymentStatusLabel", () => {
    it("maps known statuses to their copy", () => {
      expect(getPaymentStatusLabel("awaiting_payment", "cod")).toBe(
        "Awaiting payment"
      );
      expect(getPaymentStatusLabel("paid", "card")).toBe("Paid");
      expect(getPaymentStatusLabel("failed", "card")).toBe("Payment failed");
    });

    it("uses a COD-safe fallback for a missing status on a COD order", () => {
      expect(getPaymentStatusLabel(undefined, "cod")).toBe(
        "Cash on delivery — pay on arrival"
      );
    });

    it("falls back to awaiting payment for a missing status on a non-COD order", () => {
      expect(getPaymentStatusLabel(undefined, "card")).toBe("Awaiting payment");
      expect(getPaymentStatusLabel("unknown", "card")).toBe("Awaiting payment");
    });
  });

  describe("resolvePaymentStatus", () => {
    it("always returns awaiting payment for COD", () => {
      expect(resolvePaymentStatus("cod", { success: true })).toBe(
        PAYMENT_STATUS.AWAITING
      );
      expect(resolvePaymentStatus("cod", { success: false })).toBe(
        PAYMENT_STATUS.AWAITING
      );
      expect(resolvePaymentStatus("cod")).toBe(PAYMENT_STATUS.AWAITING);
    });

    it("returns paid for a successful digital payment", () => {
      expect(resolvePaymentStatus("card", { success: true })).toBe(
        PAYMENT_STATUS.PAID
      );
    });

    it("returns failed for an unsuccessful digital payment", () => {
      expect(resolvePaymentStatus("card", { success: false })).toBe(
        PAYMENT_STATUS.FAILED
      );
    });
  });
});
