const PAYMENT_TYPES = ["cod", "wallet"];
const PAYMENT_UPDATE_STATUSES = ["pending", "paid", "failed"];
const DIGITAL_PAYMENT_TYPES = ["wallet"];

const isDigitalPaymentType = (paymentType) =>
  DIGITAL_PAYMENT_TYPES.includes(paymentType);

const resolveInitialPaymentStatus = (paymentType) =>
  isDigitalPaymentType(paymentType) ? "pending" : "pay_on_delivery";

const normalizeOrderPayment = (order) => {
  if (!order) return order;

  const paymentType = PAYMENT_TYPES.includes(order.payment_type)
    ? order.payment_type
    : "cod";
  const fallbackTimestamp =
    order.payment_updated_at ||
    order.updatedAt ||
    order.createdAt ||
    new Date().toISOString();

  Object.assign(order, {
    payment_type: paymentType,
    payment_status:
      typeof order.payment_status === "string"
        ? order.payment_status
        : resolveInitialPaymentStatus(paymentType),
    payment_reference: order.payment_reference || null,
    payment_failure_reason: order.payment_failure_reason || null,
    payment_updated_at: fallbackTimestamp,
  });

  return order;
};

const updateOrderPayment = (order, nextStatus, metadata = {}) => {
  normalizeOrderPayment(order);

  if (!PAYMENT_UPDATE_STATUSES.includes(nextStatus)) {
    return { ok: false, message: "Invalid payment status" };
  }

  if (!isDigitalPaymentType(order.payment_type)) {
    return {
      ok: false,
      message: "Cannot change payment after terminal resolution",
    };
  }

  if (order.payment_status === nextStatus) {
    return { ok: true, order, changed: false };
  }

  if (order.payment_status !== "pending") {
    return {
      ok: false,
      message: "Cannot change payment after terminal resolution",
    };
  }

  const now = new Date().toISOString();
  order.payment_status = nextStatus;
  order.payment_updated_at = now;
  order.updatedAt = now;

  if (metadata.payment_reference) {
    order.payment_reference = metadata.payment_reference;
  }

  if (nextStatus === "paid") {
    order.payment_failure_reason = null;
  }

  if (nextStatus === "failed") {
    order.payment_failure_reason = metadata.failure_reason || null;
  }

  return { ok: true, order, changed: true };
};

const canAdvanceFulfillment = (order, nextStatus) => {
  normalizeOrderPayment(order);

  if (!isDigitalPaymentType(order.payment_type)) {
    return true;
  }

  if (!["shipped", "delivered"].includes(nextStatus)) {
    return true;
  }

  return order.payment_status === "paid";
};

module.exports = {
  PAYMENT_TYPES,
  PAYMENT_UPDATE_STATUSES,
  isDigitalPaymentType,
  resolveInitialPaymentStatus,
  normalizeOrderPayment,
  updateOrderPayment,
  canAdvanceFulfillment,
};
