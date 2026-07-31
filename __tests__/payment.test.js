import React from "react";

describe("Payment Utilities and Flows", () => {
  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case "card":
        return "Credit/Debit Card";
      case "wallet":
        return "Digital Wallet";
      case "cod":
      default:
        return "Cash on Delivery";
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
      default:
        return "Pending";
    }
  };

  const validateCardInputs = (cardholderName, cardNumber, cardExpiry, cardCVV) => {
    if (!cardholderName.trim()) return false;
    const cleanCardNumber = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanCardNumber)) return false;
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return false;
    if (!/^\d{3,4}$/.test(cardCVV)) return false;
    return true;
  };

  test("getPaymentTypeLabel returns correct user-facing labels", () => {
    expect(getPaymentTypeLabel("cod")).toBe("Cash on Delivery");
    expect(getPaymentTypeLabel("card")).toBe("Credit/Debit Card");
    expect(getPaymentTypeLabel("wallet")).toBe("Digital Wallet");
    expect(getPaymentTypeLabel(null)).toBe("Cash on Delivery");
  });

  test("getPaymentStatusLabel returns correct user-facing labels", () => {
    expect(getPaymentStatusLabel("pending")).toBe("Pending");
    expect(getPaymentStatusLabel("paid")).toBe("Paid");
    expect(getPaymentStatusLabel(null)).toBe("Pending");
  });

  test("validateCardInputs enforces correct formats", () => {
    // Valid inputs
    expect(validateCardInputs("John Doe", "1234 5678 1234 5678", "12/26", "123")).toBe(true);
    expect(validateCardInputs("Jane Smith", "9876543210987654", "08/30", "4321")).toBe(true);

    // Invalid: missing cardholder name
    expect(validateCardInputs(" ", "1234 5678 1234 5678", "12/26", "123")).toBe(false);

    // Invalid: card number not 16 digits
    expect(validateCardInputs("John Doe", "1234 5678 1234 567", "12/26", "123")).toBe(false);
    expect(validateCardInputs("John Doe", "1234 5678 1234 56789", "12/26", "123")).toBe(false);

    // Invalid: expiry not MM/YY
    expect(validateCardInputs("John Doe", "1234 5678 1234 5678", "12-26", "123")).toBe(false);
    expect(validateCardInputs("John Doe", "1234 5678 1234 5678", "12/2026", "123")).toBe(false);

    // Invalid: CVV not 3 or 4 digits
    expect(validateCardInputs("John Doe", "1234 5678 1234 5678", "12/26", "12")).toBe(false);
    expect(validateCardInputs("John Doe", "1234 5678 1234 5678", "12/26", "12345")).toBe(false);
  });
});
