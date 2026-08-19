import { DEMO_CARD_FAIL_SUFFIX } from "../constants/Payment";

/**
 * @param {{ cardNumber: string, cardExpiry: string, cardCvv: string, failSuffix?: string }} input
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateDemoCard({
  cardNumber,
  cardExpiry,
  cardCvv,
  failSuffix = DEMO_CARD_FAIL_SUFFIX,
}) {
  const numberDigits = String(cardNumber).replace(/\D/g, "");
  if (!numberDigits || !String(cardExpiry).trim() || !String(cardCvv).trim()) {
    return { ok: false, message: "Enter demo card number, expiry, and CVV." };
  }
  if (numberDigits.length < 12) {
    return { ok: false, message: "Demo card number must be at least 12 digits." };
  }
  if (numberDigits.endsWith(failSuffix)) {
    return {
      ok: false,
      message: "Demo card payment failed. Try another test card (do not end with 0000).",
    };
  }
  return { ok: true };
}
