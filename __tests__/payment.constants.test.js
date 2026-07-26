/* eslint-env jest */

import {
  PAYMENT_METHODS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  getEffectivePaymentStatus,
  isWalletPayment,
} from "../constants/payment";

describe("payment constants", () => {
  it("keeps wallet and cod methods distinct", () => {
    expect(PAYMENT_METHODS.COD).toBe("cod");
    expect(PAYMENT_METHODS.WALLET).toBe("wallet");
    expect(isWalletPayment("wallet")).toBe(true);
    expect(isWalletPayment("cod")).toBe(false);
  });

  it("hydrates legacy cod orders as pending until delivered", () => {
    expect(getEffectivePaymentStatus({ payment_type: "cod", status: "pending" })).toBe(
      "pending"
    );
    expect(getEffectivePaymentStatus({ payment_type: "cod", status: "delivered" })).toBe(
      "paid"
    );
  });

  it("preserves wallet states", () => {
    expect(
      getEffectivePaymentStatus({
        payment_type: "wallet",
        payment_status: "pending",
        status: "pending",
      })
    ).toBe("pending");
    expect(
      getEffectivePaymentStatus({
        payment_type: "wallet",
        payment_status: "paid",
        status: "pending",
      })
    ).toBe("paid");
    expect(
      getEffectivePaymentStatus({
        payment_type: "wallet",
        payment_status: "failed",
        status: "pending",
      })
    ).toBe("failed");
  });

  it("exposes labels and colors for supported statuses", () => {
    expect(PAYMENT_STATUS_LABELS).toMatchObject({
      pending: "Pending",
      paid: "Paid",
      failed: "Failed",
    });
    expect(PAYMENT_STATUS_COLORS.pending).toBeDefined();
    expect(PAYMENT_STATUS_COLORS.paid).toBeDefined();
    expect(PAYMENT_STATUS_COLORS.failed).toBeDefined();
  });
});
