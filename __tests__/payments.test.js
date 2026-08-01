jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import * as api from "../api";

describe("Payment Integration and Validation Tests", () => {
  // 1. Card Field Constraints & Validation Tests
  describe("Card details format validation", () => {
    const validateCard = (cardholder_name, card_number, expiry, cvv) => {
      const isCardholderNameValid = cardholder_name.trim().length > 0;
      const isCardNumberValid = /^\d{16}$/.test(card_number);
      const isExpiryValid = /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry);
      const isCvvValid = /^\d{3}$/.test(cvv);
      return isCardholderNameValid && isCardNumberValid && isExpiryValid && isCvvValid;
    };

    it("accepts a valid credit card details set", () => {
      expect(validateCard("John Doe", "1234567812345678", "12/28", "123")).toBe(true);
    });

    it("rejects an empty cardholder name", () => {
      expect(validateCard("", "1234567812345678", "12/28", "123")).toBe(false);
    });

    it("rejects a card number with less than 16 digits", () => {
      expect(validateCard("John Doe", "12345678", "12/28", "123")).toBe(false);
    });

    it("rejects a card number with more than 16 digits", () => {
      expect(validateCard("John Doe", "12345678123456789", "12/28", "123")).toBe(false);
    });

    it("rejects card numbers with alphabetical characters", () => {
      expect(validateCard("John Doe", "123456781234567a", "12/28", "123")).toBe(false);
    });

    it("rejects an invalid MM/YY expiry format (e.g. 2 digits only)", () => {
      expect(validateCard("John Doe", "1234567812345678", "1228", "123")).toBe(false);
    });

    it("rejects an invalid MM month (e.g. 13/28)", () => {
      expect(validateCard("John Doe", "1234567812345678", "13/28", "123")).toBe(false);
    });

    it("rejects an invalid YY format (e.g. YY only)", () => {
      expect(validateCard("John Doe", "1234567812345678", "05/", "123")).toBe(false);
    });

    it("rejects a CVV with less than 3 digits", () => {
      expect(validateCard("John Doe", "1234567812345678", "12/28", "12")).toBe(false);
    });

    it("rejects a CVV with non-numeric characters", () => {
      expect(validateCard("John Doe", "1234567812345678", "12/28", "12a")).toBe(false);
    });
  });

  // 2. Submit Guard Logic Tests
  describe("Checkout Submission Guard Logic", () => {
    const checkSubmitGuard = (isAddressValid, paymentType, isCardValid, walletVerified) => {
      const isPaymentValid =
        paymentType === "Cash on Delivery" ||
        (paymentType === "Debit/Credit Card" && isCardValid) ||
        (paymentType === "EasyBuy Wallet" && walletVerified);
      return isAddressValid && isPaymentValid;
    };

    it("enables order submission when address is valid and COD is selected", () => {
      expect(checkSubmitGuard(true, "Cash on Delivery", false, false)).toBe(true);
    });

    it("disables order submission when address is invalid", () => {
      expect(checkSubmitGuard(false, "Cash on Delivery", true, true)).toBe(false);
    });

    it("enables order submission when Card is selected and card details are valid", () => {
      expect(checkSubmitGuard(true, "Debit/Credit Card", true, false)).toBe(true);
    });

    it("disables order submission when Card is selected but card details are invalid", () => {
      expect(checkSubmitGuard(true, "Debit/Credit Card", false, false)).toBe(false);
    });

    it("enables order submission when Wallet is selected and wallet is verified", () => {
      expect(checkSubmitGuard(true, "EasyBuy Wallet", false, true)).toBe(true);
    });

    it("disables order submission when Wallet is selected but wallet is not verified", () => {
      expect(checkSubmitGuard(true, "EasyBuy Wallet", true, false)).toBe(false);
    });
  });

  // 3. API helper definitions
  describe("API Client Helper registrations", () => {
    it("exports getWalletBalance function", () => {
      expect(typeof api.getWalletBalance).toBe("function");
    });

    it("exports checkout function", () => {
      expect(typeof api.checkout).toBe("function");
    });
  });
});