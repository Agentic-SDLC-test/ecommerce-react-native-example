export const formatPaymentMethod = (paymentType) =>
  paymentType === "wallet_mock" ? "EasyBuy Wallet (simulated)" : "Cash On Delivery";

export const formatPaymentStatus = (paymentStatus) =>
  paymentStatus === "paid" ? "Paid (simulated)" : "Payment due on delivery";
