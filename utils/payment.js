const PAYMENT_METHOD_LABELS = {
  cod: "Cash on delivery",
  wallet: "EasyBuy Wallet",
};

const PAYMENT_STATUS_LABELS = {
  pay_on_delivery: "Pay on delivery",
  pending: "Pending payment",
  paid: "Paid",
  failed: "Payment failed",
};

const PAYMENT_STATUS_TONES = {
  pay_on_delivery: "warning",
  pending: "warning",
  paid: "success",
  failed: "danger",
};

export const isDigitalPaymentType = (paymentType) => paymentType === "wallet";

export const isMockWalletEnabled = () =>
  typeof process !== "undefined" &&
  process?.env?.EXPO_PUBLIC_ENABLE_MOCK_WALLET === "true";

export const getPaymentMethodLabel = (paymentType) =>
  PAYMENT_METHOD_LABELS[paymentType] || "Unknown payment method";

export const getPaymentStatusLabel = (paymentStatus) =>
  PAYMENT_STATUS_LABELS[paymentStatus] || "Unknown payment state";

export const getPaymentStatusTone = (paymentStatus) =>
  PAYMENT_STATUS_TONES[paymentStatus] || "warning";

export const getOrderConfirmationCopy = (paymentStatus) => {
  switch (paymentStatus) {
    case "pending":
      return {
        heading: "Order saved while payment is pending",
        message:
          "Your order has been created and is waiting for your EasyBuy Wallet payment.",
      };
    case "paid":
      return {
        heading: "Wallet payment received",
        message:
          "Your EasyBuy Wallet payment is complete and your order is ready for fulfillment.",
      };
    case "failed":
      return {
        heading: "Order saved, but payment failed",
        message:
          "Your order is still in history, but the EasyBuy Wallet payment did not complete.",
      };
    case "pay_on_delivery":
    default:
      return {
        heading: "Order has be confirmed",
        message:
          "Your order is confirmed and payment will be collected when it is delivered.",
      };
  }
};

export const formatPaymentUpdatedAt = (value) => {
  if (!value) return "Not updated yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not updated yet";
  }

  const pad = (part) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};
