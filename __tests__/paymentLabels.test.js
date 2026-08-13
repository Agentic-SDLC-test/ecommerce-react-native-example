import {
  formatPaymentType,
  formatPaymentStatus,
} from "../utils/paymentLabels";

describe("formatPaymentType", () => {
  it("labels COD", () => {
    expect(formatPaymentType("cod")).toBe("Cash On Delivery");
  });

  it("labels wallet as demo", () => {
    expect(formatPaymentType("wallet")).toBe("Pay with Wallet (Demo)");
  });

  it("defaults unknown types to Cash On Delivery", () => {
    expect(formatPaymentType(undefined)).toBe("Cash On Delivery");
  });
});

describe("formatPaymentStatus", () => {
  it("labels paid", () => {
    expect(formatPaymentStatus("paid", "wallet")).toBe("Paid");
  });

  it("labels failed", () => {
    expect(formatPaymentStatus("failed", "wallet")).toBe("Failed");
  });

  it("labels COD pending with due-on-delivery note", () => {
    expect(formatPaymentStatus("pending", "cod")).toBe(
      "Pending payment (Due on delivery)"
    );
  });

  it("labels generic pending when type is not COD", () => {
    expect(formatPaymentStatus("pending", "wallet")).toBe("Pending payment");
  });

  it("treats missing status as pending", () => {
    expect(formatPaymentStatus(undefined, "cod")).toBe(
      "Pending payment (Due on delivery)"
    );
  });
});
