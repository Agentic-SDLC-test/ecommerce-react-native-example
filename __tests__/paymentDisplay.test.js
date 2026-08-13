import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../utils/paymentDisplay";

describe("paymentDisplay utils", () => {
  describe("getPaymentMethodLabel", () => {
    it("returns label for cod", () => {
      expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    });

    it("returns label for wallet", () => {
      expect(getPaymentMethodLabel("wallet")).toBe("Digital Wallet");
    });

    it("returns Unknown for undefined payment type", () => {
      expect(getPaymentMethodLabel(undefined)).toBe("Unknown");
    });

    it("title-cases unknown payment types", () => {
      expect(getPaymentMethodLabel("card")).toBe("Card");
    });
  });

  describe("getPaymentStatusLabel", () => {
    it("returns Pay on delivery for cod legacy missing status", () => {
      expect(getPaymentStatusLabel(undefined, "cod")).toBe("Pay on delivery");
    });

    it("returns Paid for wallet legacy missing status", () => {
      expect(getPaymentStatusLabel(undefined, "wallet")).toBe("Paid");
    });

    it("returns Paid for wallet with paid status", () => {
      expect(getPaymentStatusLabel("paid", "wallet")).toBe("Paid");
    });

    it("returns Unknown when both status and type are missing", () => {
      expect(getPaymentStatusLabel(undefined, undefined)).toBe("Unknown");
    });
  });
});
