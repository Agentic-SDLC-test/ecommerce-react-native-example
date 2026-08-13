import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../constants/payment";

const titleCase = (value) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const getPaymentMethodLabel = (paymentType) => {
  if (!paymentType) {
    return "Unknown";
  }
  if (PAYMENT_METHOD_LABELS[paymentType]) {
    return PAYMENT_METHOD_LABELS[paymentType];
  }
  return titleCase(paymentType);
};

export const getPaymentStatusLabel = (paymentStatus, paymentType) => {
  if (paymentStatus) {
    if (PAYMENT_STATUS_LABELS[paymentStatus]) {
      return PAYMENT_STATUS_LABELS[paymentStatus];
    }
    return titleCase(paymentStatus);
  }
  if (paymentType === "cod") {
    return "Pay on delivery";
  }
  if (paymentType === "wallet") {
    return "Paid";
  }
  return "Unknown";
};
