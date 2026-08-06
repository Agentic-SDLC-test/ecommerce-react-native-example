// Produces a believable payment outcome with no network call, no credential and
// no card data. This module has the shape a real gateway client would have
// ({ result, reference, message }), so swapping in a real provider means
// replacing this file — checkout, the order payload and every read surface stay
// unchanged.

// Display-only test values for the card panel. Rendered as read-only text, never
// as an input, and never included in any payload or log.
export const SIMULATED_CARD = Object.freeze({
  brand: "VISA",
  number: "4242 4242 4242 4242",
  expiry: "12/34",
  cvc: "***",
});

export const SIMULATION_OUTCOMES = Object.freeze({
  APPROVE: "approve",
  DECLINE: "decline",
});

const REFERENCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// The reference doubles as the idempotency key for order creation, so a retry
// after a decline must produce a value that cannot collide with an earlier one.
function newReference() {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += REFERENCE_ALPHABET.charAt(
      Math.floor(Math.random() * REFERENCE_ALPHABET.length)
    );
  }
  return `SIMPAY-${Date.now()}-${suffix}`;
}

export function simulateCardPayment({ amount, outcome = "approve", delayMs = 1200 }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return Promise.reject(
      new Error("Payment amount must be greater than zero")
    );
  }
  if (
    outcome !== SIMULATION_OUTCOMES.APPROVE &&
    outcome !== SIMULATION_OUTCOMES.DECLINE
  ) {
    return Promise.reject(new Error("Unknown simulation outcome: " + outcome));
  }

  // Wait so the progress dialog reads as work rather than a flicker. Tests pass
  // delayMs: 0 to stay fast.
  return new Promise((resolve) => {
    setTimeout(() => {
      if (outcome === SIMULATION_OUTCOMES.APPROVE) {
        resolve({
          result: "approved",
          reference: newReference(),
          message: "Payment approved (simulated).",
        });
      } else {
        resolve({
          result: "declined",
          reference: null,
          message:
            "Your payment was declined. No money has been taken — you can try again or choose Cash on Delivery.",
        });
      }
    }, delayMs);
  });
}
