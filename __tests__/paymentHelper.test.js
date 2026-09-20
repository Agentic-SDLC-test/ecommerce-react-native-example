import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "../utils/paymentHelper";

const colors = {
  warning: "#FBD431",
  success: "#90ee90",
  danger: "#FF4848",
  muted: "#707981",
};

describe("Payment helper utilities", () => {
  describe("getPaymentMethodLabel", () => {
    it("labels cash on delivery", () => {
      expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    });

    it("labels the demo wallet", () => {
      expect(getPaymentMethodLabel("wallet")).toBe("Wallet (Demo)");
    });

    it("falls back to Unknown for unrecognized or missing types", () => {
      expect(getPaymentMethodLabel("crypto")).toBe("Unknown");
      expect(getPaymentMethodLabel(undefined)).toBe("Unknown");
    });
  });

  describe("getPaymentStatusLabel", () => {
    it("labels pending", () => {
      expect(getPaymentStatusLabel("pending")).toBe("Pending");
    });

    it("labels paid", () => {
      expect(getPaymentStatusLabel("paid")).toBe("Paid");
    });

    it("labels failed", () => {
      expect(getPaymentStatusLabel("failed")).toBe("Failed");
    });

    it("falls back to Unknown for unrecognized or missing statuses", () => {
      expect(getPaymentStatusLabel("refunded")).toBe("Unknown");
      expect(getPaymentStatusLabel(undefined)).toBe("Unknown");
    });
  });

  describe("getPaymentStatusColor", () => {
    it("maps pending to the warning color", () => {
      expect(getPaymentStatusColor("pending", colors)).toBe(colors.warning);
    });

    it("maps paid to the success color", () => {
      expect(getPaymentStatusColor("paid", colors)).toBe(colors.success);
    });

    it("maps failed to the danger color", () => {
      expect(getPaymentStatusColor("failed", colors)).toBe(colors.danger);
    });

    it("falls back to the muted color for unrecognized or missing statuses", () => {
      expect(getPaymentStatusColor("refunded", colors)).toBe(colors.muted);
      expect(getPaymentStatusColor(undefined, colors)).toBe(colors.muted);
    });
  });
});
