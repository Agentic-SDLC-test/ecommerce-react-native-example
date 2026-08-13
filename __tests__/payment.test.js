import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  getPaymentStatusForMethod,
  formatPaymentMethod,
  formatPaymentStatus,
  normalizeOrderPayment,
} from "../utils/payment";

describe("payment helpers", () => {
  describe("getPaymentStatusForMethod", () => {
    it("returns paid for mock wallet", () => {
      expect(getPaymentStatusForMethod(PAYMENT_METHODS.MOCK_WALLET)).toBe(
        PAYMENT_STATUSES.PAID
      );
    });

    it("returns due_on_delivery for cod", () => {
      expect(getPaymentStatusForMethod(PAYMENT_METHODS.COD)).toBe(
        PAYMENT_STATUSES.DUE_ON_DELIVERY
      );
    });

    it("returns due_on_delivery for unknown values", () => {
      expect(getPaymentStatusForMethod("unknown")).toBe(
        PAYMENT_STATUSES.DUE_ON_DELIVERY
      );
    });
  });

  describe("formatPaymentMethod", () => {
    it("formats mock wallet", () => {
      expect(formatPaymentMethod(PAYMENT_METHODS.MOCK_WALLET)).toBe(
        "Mock Wallet"
      );
    });

    it("formats cod and missing as Cash On Delivery", () => {
      expect(formatPaymentMethod(PAYMENT_METHODS.COD)).toBe(
        "Cash On Delivery"
      );
      expect(formatPaymentMethod(undefined)).toBe("Cash On Delivery");
    });
  });

  describe("formatPaymentStatus", () => {
    it("formats paid status", () => {
      expect(formatPaymentStatus(PAYMENT_STATUSES.PAID)).toBe("Paid");
    });

    it("formats due on delivery for cod", () => {
      expect(
        formatPaymentStatus(PAYMENT_STATUSES.DUE_ON_DELIVERY, PAYMENT_METHODS.COD)
      ).toBe("Payment due on delivery");
    });

    it("defaults to Payment due on delivery when values missing", () => {
      expect(formatPaymentStatus(undefined, undefined)).toBe(
        "Payment due on delivery"
      );
    });
  });

  describe("normalizeOrderPayment", () => {
    it("normalizes mock wallet order", () => {
      const result = normalizeOrderPayment({
        payment_type: PAYMENT_METHODS.MOCK_WALLET,
        payment_status: PAYMENT_STATUSES.PAID,
      });
      expect(result.payment_type).toBe(PAYMENT_METHODS.MOCK_WALLET);
      expect(result.payment_status).toBe(PAYMENT_STATUSES.PAID);
    });

    it("defaults legacy orders to cod due on delivery", () => {
      const result = normalizeOrderPayment({});
      expect(result.payment_type).toBe(PAYMENT_METHODS.COD);
      expect(result.payment_status).toBe(PAYMENT_STATUSES.DUE_ON_DELIVERY);
    });
  });
});
