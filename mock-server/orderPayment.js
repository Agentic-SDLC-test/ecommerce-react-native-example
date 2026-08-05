const VALID_PAYMENT_TYPES = ["cod", "wallet_mock"];
const COD_PAYMENT_MESSAGE = "Pay on delivery";
const WALLET_PAYMENT_MESSAGE = "Mock wallet payment recorded. No live charge was made.";

function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function derivePaymentFields({ payment_type, payment_acknowledged }) {
  if (!VALID_PAYMENT_TYPES.includes(payment_type)) {
    throw createValidationError("Invalid payment type");
  }

  if (payment_type === "wallet_mock" && payment_acknowledged !== true) {
    throw createValidationError("Wallet mock acknowledgement is required");
  }

  if (payment_type === "wallet_mock") {
    return {
      payment_type,
      payment_status: "paid",
      payment_reference: `MOCK-${Date.now()}`,
      payment_message: WALLET_PAYMENT_MESSAGE,
    };
  }

  return {
    payment_type: "cod",
    payment_status: "pending",
    payment_reference: null,
    payment_message: COD_PAYMENT_MESSAGE,
  };
}

function serializeOrder(order) {
  const paymentType = order?.payment_type || "cod";
  const paymentStatus = order?.payment_status || "pending";

  return {
    ...order,
    payment_type: paymentType,
    payment_status: paymentStatus,
    payment_reference: order?.payment_reference || null,
    payment_message:
      order?.payment_message ||
      (paymentType === "wallet_mock" ? WALLET_PAYMENT_MESSAGE : COD_PAYMENT_MESSAGE),
  };
}

module.exports = {
  COD_PAYMENT_MESSAGE,
  VALID_PAYMENT_TYPES,
  WALLET_PAYMENT_MESSAGE,
  derivePaymentFields,
  serializeOrder,
};
