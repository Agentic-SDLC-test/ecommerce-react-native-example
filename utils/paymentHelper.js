export const getPaymentMethodLabel = (paymentType) => {
  switch (paymentType) {
    case "cod":
      return "Cash on Delivery";
    case "wallet":
      return "Wallet (Demo)";
    default:
      return "Unknown";
  }
};

export const getPaymentStatusLabel = (paymentStatus) => {
  switch (paymentStatus) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};

export const getPaymentStatusColor = (paymentStatus, colors) => {
  switch (paymentStatus) {
    case "pending":
      return colors.warning;
    case "paid":
      return colors.success;
    case "failed":
      return colors.danger;
    default:
      return colors.muted;
  }
};
