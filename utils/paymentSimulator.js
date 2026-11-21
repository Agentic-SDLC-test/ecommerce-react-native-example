const FAILING_TEST_CARD = "4000000000000002";

export const isFailingTestCard = (cardNumber) =>
  String(cardNumber || "").replace(/\D/g, "") === FAILING_TEST_CARD;

// Simulates a card payment. No network, no storage, no card data kept.
export const simulateCardPayment = ({ amount, forceFail = false, delayMs = 800 } = {}) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (forceFail) {
        resolve({
          success: false,
          message: "Payment declined (demo). Try again or choose Cash On Delivery.",
        });
      } else {
        resolve({ success: true, reference: "SIM-" + Date.now() });
      }
    }, delayMs);
  });
