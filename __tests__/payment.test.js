import {
  PAYMENT_TYPES,
  PAYMENT_STATUSES,
  DIGITAL_PAYMENT_ENABLED,
  normalizePaymentType,
  normalizePaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "../constants/Payment";

// A minimal colors stub so the color tests don't couple to the real palette
// values in constants/Colors.js.
const colors = { success: "#success", danger: "#danger", muted: "#muted" };

describe("Payment constants", () => {
  it("exposes the payment type and status enums plus the rollback flag", () => {
    expect(PAYMENT_TYPES).toEqual({ COD: "cod", CARD: "card" });
    expect(PAYMENT_STATUSES).toEqual({
      AWAITING: "awaiting_payment",
      PAID: "paid",
      FAILED: "failed",
    });
    expect(DIGITAL_PAYMENT_ENABLED).toBe(true);
  });
});

describe("normalizePaymentType", () => {
  it("keeps card", () => {
    expect(normalizePaymentType("card")).toBe("card");
  });

  it("defaults cod, unknown, and missing values to cod (legacy safe)", () => {
    expect(normalizePaymentType("cod")).toBe("cod");
    expect(normalizePaymentType("wallet")).toBe("cod");
    expect(normalizePaymentType(undefined)).toBe("cod");
    expect(normalizePaymentType(null)).toBe("cod");
  });
});

describe("normalizePaymentStatus", () => {
  it("keeps paid and failed", () => {
    expect(normalizePaymentStatus("paid")).toBe("paid");
    expect(normalizePaymentStatus("failed")).toBe("failed");
  });

  it("defaults awaiting, unknown, and missing values to awaiting_payment (legacy safe)", () => {
    expect(normalizePaymentStatus("awaiting_payment")).toBe("awaiting_payment");
    expect(normalizePaymentStatus("cod")).toBe("awaiting_payment");
    expect(normalizePaymentStatus(undefined)).toBe("awaiting_payment");
    expect(normalizePaymentStatus(null)).toBe("awaiting_payment");
  });
});

describe("getPaymentMethodLabel", () => {
  it("labels card and cod", () => {
    expect(getPaymentMethodLabel("card")).toBe("Card (Simulated)");
    expect(getPaymentMethodLabel("cod")).toBe("Cash On Delivery");
  });

  it("labels legacy/missing methods as Cash On Delivery", () => {
    expect(getPaymentMethodLabel(undefined)).toBe("Cash On Delivery");
  });
});

describe("getPaymentStatusLabel", () => {
  it("labels each known status", () => {
    expect(getPaymentStatusLabel("paid")).toBe("Paid");
    expect(getPaymentStatusLabel("failed")).toBe("Failed");
    expect(getPaymentStatusLabel("awaiting_payment")).toBe("Awaiting Payment");
  });

  it("labels legacy/missing status as Awaiting Payment", () => {
    expect(getPaymentStatusLabel(undefined)).toBe("Awaiting Payment");
  });
});

describe("getPaymentStatusColor", () => {
  it("maps paid to success, failed to danger, everything else to muted", () => {
    expect(getPaymentStatusColor("paid", colors)).toBe(colors.success);
    expect(getPaymentStatusColor("failed", colors)).toBe(colors.danger);
    expect(getPaymentStatusColor("awaiting_payment", colors)).toBe(colors.muted);
    expect(getPaymentStatusColor(undefined, colors)).toBe(colors.muted);
  });
});
