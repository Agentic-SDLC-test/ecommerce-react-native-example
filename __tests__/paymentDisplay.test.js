import { formatPaymentMethod, formatPaymentStatus } from "../utils/paymentDisplay";

describe("payment display labels", () => {
  it("formats approved payment methods and statuses", () => {
    expect(formatPaymentMethod("cod")).toBe("Cash On Delivery");
    expect(formatPaymentMethod("wallet_mock")).toBe("EasyBuy Wallet (simulated)");
    expect(formatPaymentStatus("payment_due")).toBe("Payment due on delivery");
    expect(formatPaymentStatus("paid")).toBe("Paid (simulated)");
  });

  it("uses COD labels for legacy orders without payment fields", () => {
    expect(formatPaymentMethod()).toBe("Cash On Delivery");
    expect(formatPaymentStatus()).toBe("Payment due on delivery");
  });
});
