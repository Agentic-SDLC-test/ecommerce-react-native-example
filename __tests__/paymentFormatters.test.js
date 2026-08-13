import {
  formatPaymentMethod,
  formatPaymentStatus,
  getPaymentStatusForType,
  PAYMENT_STATUS_BY_TYPE,
} from "../utils/paymentFormatters";

describe("paymentFormatters", () => {
  describe("getPaymentStatusForType", () => {
    it("returns pending_on_delivery for cod", () => {
      expect(getPaymentStatusForType("cod")).toBe("pending_on_delivery");
    });

    it("returns mock_paid for mock_wallet", () => {
      expect(getPaymentStatusForType("mock_wallet")).toBe("mock_paid");
    });

    it("falls back to pending_on_delivery for unknown types", () => {
      expect(getPaymentStatusForType("unknown")).toBe("pending_on_delivery");
    });
  });

  describe("formatPaymentMethod", () => {
    it("maps cod to Cash On Delivery", () => {
      expect(formatPaymentMethod("cod")).toBe("Cash On Delivery");
    });

    it("maps mock_wallet to Mock Wallet Payment", () => {
      expect(formatPaymentMethod("mock_wallet")).toBe("Mock Wallet Payment");
    });

    it("defaults missing values to Cash On Delivery", () => {
      expect(formatPaymentMethod(undefined)).toBe("Cash On Delivery");
    });
  });

  describe("formatPaymentStatus", () => {
    it("maps pending_on_delivery to Payment pending on delivery", () => {
      expect(formatPaymentStatus("pending_on_delivery")).toBe(
        "Payment pending on delivery"
      );
    });

    it("maps mock_paid to Mock payment completed", () => {
      expect(formatPaymentStatus("mock_paid")).toBe("Mock payment completed");
    });

    it("derives COD default when payment_status is missing", () => {
      expect(formatPaymentStatus(undefined, "cod")).toBe(
        "Payment pending on delivery"
      );
    });

    it("derives mock wallet default when payment_status is missing", () => {
      expect(formatPaymentStatus(undefined, "mock_wallet")).toBe(
        "Mock payment completed"
      );
    });
  });

  describe("PAYMENT_STATUS_BY_TYPE", () => {
    it("defines canonical statuses for supported payment types", () => {
      expect(PAYMENT_STATUS_BY_TYPE).toEqual({
        cod: "pending_on_delivery",
        mock_wallet: "mock_paid",
      });
    });
  });
});
