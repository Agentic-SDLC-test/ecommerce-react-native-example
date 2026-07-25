/* global describe, it, expect */

import {
  canResumeWalletPayment,
  getEffectivePaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusTone,
} from "../utils/paymentPresentation";

describe("paymentPresentation helpers", () => {
  it("maps payment methods and statuses to shopper-friendly labels", () => {
    expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    expect(getPaymentMethodLabel("wallet")).toBe("Pay with Wallet");
    expect(getPaymentStatusLabel("pay_on_delivery", "cod")).toBe("Pay on delivery");
    expect(getPaymentStatusLabel("pending", "wallet")).toBe("Pending payment");
    expect(getPaymentStatusLabel("paid", "wallet")).toBe("Paid");
    expect(getPaymentStatusLabel("failed", "wallet")).toBe("Payment failed");
    expect(getPaymentStatusLabel("cancelled", "wallet")).toBe("Payment cancelled");
  });

  it("maps tones for every supported payment status", () => {
    expect(getPaymentStatusTone("pay_on_delivery", "cod")).toBe("muted");
    expect(getPaymentStatusTone("pending", "wallet")).toBe("warning");
    expect(getPaymentStatusTone("paid", "wallet")).toBe("success");
    expect(getPaymentStatusTone("failed", "wallet")).toBe("danger");
    expect(getPaymentStatusTone("cancelled", "wallet")).toBe("danger");
  });

  it("treats legacy cod orders as pay on delivery when payment status is absent", () => {
    expect(getEffectivePaymentStatus(undefined, "cod")).toBe("pay_on_delivery");
  });

  it("marks unresolved wallet orders as resumable", () => {
    expect(
      canResumeWalletPayment({ payment_type: "wallet", payment_status: "pending" })
    ).toBe(true);
    expect(
      canResumeWalletPayment({ payment_type: "wallet", payment_status: "failed" })
    ).toBe(true);
    expect(
      canResumeWalletPayment({ payment_type: "wallet", payment_status: "cancelled" })
    ).toBe(true);
    expect(
      canResumeWalletPayment({ payment_type: "wallet", payment_status: "paid" })
    ).toBe(false);
  });
});
