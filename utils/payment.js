import * as Domain from "@agentic-sdlc-test/easybuy-api-client/domain";

const { PaymentType } = Domain;
export const PaymentStatus = Domain.PaymentStatus ?? {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

export const PAYMENT_METHODS = [
  {
    type: PaymentType.COD,
    label: "Cash On Delivery",
    description: "Pay when your order arrives",
  },
  {
    type: PaymentType.ONLINE,
    label: "Card (demo)",
    description: "Simulated payment, no real charge",
  },
];

// Missing payment data (older orders) is shown as COD / pay on delivery.
export const getPaymentInfo = (order) => {
  const type = order?.payment_type || PaymentType.COD;
  const status = order?.payment_status || PaymentStatus.PENDING;
  const method = PAYMENT_METHODS.find((m) => m.type === type);
  const methodLabel = method ? method.label : type;

  let statusLabel;
  let tone;
  if (status === PaymentStatus.PAID) {
    statusLabel = "Paid";
    tone = "success";
  } else if (status === PaymentStatus.FAILED) {
    statusLabel = "Payment failed";
    tone = "danger";
  } else {
    statusLabel = type === PaymentType.COD ? "Pay on delivery" : "Payment pending";
    tone = "warning";
  }
  return { type, status, methodLabel, statusLabel, tone };
};

export const paymentStatusFor = (type) =>
  type === PaymentType.ONLINE ? PaymentStatus.PAID : PaymentStatus.PENDING;
