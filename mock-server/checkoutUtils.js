const CARD_FIELD_KEYS = [
  "card_number",
  "cardNumber",
  "card_expiry",
  "cardExpiry",
  "cvv",
  "cardCvv",
];

const derivePaymentStatus = (paymentType) => {
  if (paymentType === "cod") return "cod_pending";
  if (paymentType === "card") return "paid";
  return null;
};

/**
 * Remove accidental card fields from checkout body (defense in depth).
 * @returns {boolean} true if any card field was present and stripped
 */
const stripCardFieldsFromBody = (body) => {
  let hadCardFields = false;
  for (const key of CARD_FIELD_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      hadCardFields = true;
      delete body[key];
    }
  }
  return hadCardFields;
};

module.exports = {
  CARD_FIELD_KEYS,
  derivePaymentStatus,
  stripCardFieldsFromBody,
};
