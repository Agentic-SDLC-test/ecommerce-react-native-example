/**
 * Human-readable labels for order payment_type / payment_status.
 * Keep confirmation, list, and detail vocabulary consistent.
 */

export function formatPaymentType(type) {
  if (type === "wallet") {
    return "Pay with Wallet (Demo)";
  }
  return "Cash On Delivery";
}

export function formatPaymentStatus(status, type) {
  const resolved = status || "pending";
  if (resolved === "paid") {
    return "Paid";
  }
  if (resolved === "failed") {
    return "Failed";
  }
  if (type === "cod") {
    return "Pending payment (Due on delivery)";
  }
  return "Pending payment";
}
