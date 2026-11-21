import { getPaymentInfo, paymentStatusFor, PAYMENT_METHODS } from "../utils/payment";

describe("getPaymentInfo", () => {
  it("shows cod/pending as Pay on delivery", () => {
    const info = getPaymentInfo({ payment_type: "cod", payment_status: "pending" });
    expect(info.methodLabel).toBe("Cash On Delivery");
    expect(info.statusLabel).toBe("Pay on delivery");
    expect(info.tone).toBe("warning");
  });
  it("shows online/paid as Paid", () => {
    const info = getPaymentInfo({ payment_type: "online", payment_status: "paid" });
    expect(info.methodLabel).toBe("Card (demo)");
    expect(info.statusLabel).toBe("Paid");
    expect(info.tone).toBe("success");
  });
  it("shows online/failed as Payment failed", () => {
    const info = getPaymentInfo({ payment_type: "online", payment_status: "failed" });
    expect(info.statusLabel).toBe("Payment failed");
    expect(info.tone).toBe("danger");
  });
  it("shows online/pending as Payment pending", () => {
    expect(getPaymentInfo({ payment_type: "online", payment_status: "pending" }).statusLabel).toBe(
      "Payment pending"
    );
  });
  it("defaults legacy and missing orders to COD / pending", () => {
    for (const order of [undefined, null, {}]) {
      const info = getPaymentInfo(order);
      expect(info.type).toBe("cod");
      expect(info.status).toBe("pending");
      expect(info.statusLabel).toBe("Pay on delivery");
    }
  });
  it("derives status for a method", () => {
    expect(paymentStatusFor("cod")).toBe("pending");
    expect(paymentStatusFor("online")).toBe("paid");
  });
  it("offers COD and a digital method", () => {
    expect(PAYMENT_METHODS.map((m) => m.type)).toEqual(["cod", "online"]);
  });
});
