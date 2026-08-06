import colors from "../constants/Colors";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_CONFIRMATION_TEXT,
  PAYMENT_METHOD_OPTIONS,
} from "../constants/Payment";

// Pure payment logic: enablement flags, read-side normalisation of orders that
// may predate the payment fields, and construction of the /checkout body.
// No React and no network here, so every rule below is unit-testable.

const KNOWN_METHODS = Object.values(PAYMENT_METHODS);
const KNOWN_STATUSES = Object.values(PAYMENT_STATUSES);

// Read env the way api/config.js does — process may be absent in some bundles.
// Read at call time (not module load) so tests can vary the flag per case.
function envValue(name) {
  return (
    (typeof process !== "undefined" && process.env && process.env[name]) ||
    undefined
  );
}

// Default-on: the flag's job is instant rollback and preview control, so an
// unset value in a fresh clone must not hide the feature.
export function isDigitalPaymentEnabled() {
  return envValue("EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT") !== "false";
}

// Gates the Approve/Decline switch on the card screen so a stakeholder demo can
// show a decline on demand without shipping a "make it fail" toggle to shoppers.
export function arePaymentSimControlsEnabled() {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return true;
  }
  return envValue("EXPO_PUBLIC_PAYMENT_SIM_CONTROLS") === "true";
}

// The single filter point for method enablement. With digital payment off this
// returns COD only, which renders exactly today's single-method checkout.
export function getPaymentMethodOptions() {
  if (!isDigitalPaymentEnabled()) {
    return PAYMENT_METHOD_OPTIONS.filter(
      (option) => option.value === PAYMENT_METHODS.COD
    );
  }
  return PAYMENT_METHOD_OPTIONS;
}

export function resolvePaymentMethod(order) {
  const raw = order?.payment_type;
  const method = typeof raw === "string" ? raw.toLowerCase() : undefined;
  return KNOWN_METHODS.includes(method) ? method : PAYMENT_METHODS.COD;
}

// Never returns `paid` for an order that does not explicitly carry it — this is
// what keeps pre-existing orders (and orders from a backend that has not added
// the fields yet) honest rather than fabricating a payment.
export function resolvePaymentStatus(order) {
  const status = order?.payment_status;
  return KNOWN_STATUSES.includes(status)
    ? status
    : PAYMENT_STATUSES.DUE_ON_DELIVERY;
}

export function paymentMethodLabel(order) {
  return PAYMENT_METHOD_LABELS[resolvePaymentMethod(order)];
}

export function paymentStatusLabel(order) {
  return PAYMENT_STATUS_LABELS[resolvePaymentStatus(order)];
}

// Only palette values from constants/Colors — no new hex literals in new code.
export function paymentStatusTone(order) {
  switch (resolvePaymentStatus(order)) {
    case PAYMENT_STATUSES.PAID:
      return { backgroundColor: colors.success, textColor: colors.dark };
    case PAYMENT_STATUSES.FAILED:
      return { backgroundColor: colors.danger, textColor: colors.white };
    case PAYMENT_STATUSES.NOT_COMPLETED:
      return { backgroundColor: colors.shadow, textColor: colors.muted };
    default:
      return { backgroundColor: colors.warning, textColor: colors.dark };
  }
}

export function paymentConfirmationText(order) {
  if (resolvePaymentMethod(order) === PAYMENT_METHODS.COD) {
    return PAYMENT_CONFIRMATION_TEXT.cod;
  }
  return resolvePaymentStatus(order) === PAYMENT_STATUSES.PAID
    ? PAYMENT_CONFIRMATION_TEXT.card_paid
    : PAYMENT_CONFIRMATION_TEXT.card_pending;
}

export function paymentReferenceOf(order) {
  return order?.payment_reference ?? null;
}

export function paymentUpdatedAt(order) {
  return order?.payment_status_updated_at ?? null;
}

// COD is due on delivery regardless of any payment outcome that reached here —
// a cash order is never recorded as paid at the moment it is placed.
export function initialPaymentStatusFor(method, paymentResult) {
  if (!KNOWN_METHODS.includes(method)) {
    throw new Error("Unknown payment method: " + method);
  }
  if (method === PAYMENT_METHODS.COD) {
    return PAYMENT_STATUSES.DUE_ON_DELIVERY;
  }
  if (paymentResult?.result === "approved") {
    return PAYMENT_STATUSES.PAID;
  }
  if (paymentResult?.result === "declined") {
    return PAYMENT_STATUSES.FAILED;
  }
  return PAYMENT_STATUSES.NOT_COMPLETED;
}

// Builds the POST /checkout body. Emits no card fields whatsoever — the key set
// is asserted in __tests__/payment.test.js so that stays structurally true.
export function buildCheckoutPayload({
  cartItems,
  address,
  paymentMethod,
  paymentResult,
}) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cannot check out an empty cart");
  }
  if (!KNOWN_METHODS.includes(paymentMethod)) {
    throw new Error("Unknown payment method: " + paymentMethod);
  }

  const items = cartItems.map((product) => ({
    productId: product._id,
    price: product.price,
    quantity: product.quantity,
  }));

  const amount = cartItems.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0
  );

  return {
    items,
    amount,
    discount: 0,
    country: address?.country ?? "",
    status: "pending",
    city: address?.city ?? "",
    zipcode: address?.zipcode ?? "",
    shippingAddress: address?.streetAddress ?? "",
    payment_type: paymentMethod,
    payment_status: initialPaymentStatusFor(paymentMethod, paymentResult),
    payment_reference:
      paymentMethod === PAYMENT_METHODS.CARD
        ? paymentResult?.reference ?? null
        : null,
  };
}
