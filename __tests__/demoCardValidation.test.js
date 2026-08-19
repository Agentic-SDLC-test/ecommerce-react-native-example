import { validateDemoCard } from "../utils/demoCardValidation";

describe("validateDemoCard", () => {
  it("rejects missing fields", () => {
    expect(validateDemoCard({ cardNumber: "", cardExpiry: "", cardCvv: "" })).toEqual({
      ok: false,
      message: "Enter demo card number, expiry, and CVV.",
    });
    expect(
      validateDemoCard({ cardNumber: "411111111111", cardExpiry: "12/25", cardCvv: "" })
    ).toEqual({
      ok: false,
      message: "Enter demo card number, expiry, and CVV.",
    });
  });

  it("rejects card numbers shorter than 12 digits", () => {
    expect(
      validateDemoCard({ cardNumber: "41111111111", cardExpiry: "12/25", cardCvv: "123" })
    ).toEqual({
      ok: false,
      message: "Demo card number must be at least 12 digits.",
    });
  });

  it("rejects card numbers ending with 0000", () => {
    expect(
      validateDemoCard({
        cardNumber: "41111111110000",
        cardExpiry: "12/25",
        cardCvv: "123",
      })
    ).toEqual({
      ok: false,
      message: "Demo card payment failed. Try another test card (do not end with 0000).",
    });
  });

  it("accepts valid demo card input", () => {
    expect(
      validateDemoCard({
        cardNumber: "4111 1111 1111 1111",
        cardExpiry: "12/25",
        cardCvv: "123",
      })
    ).toEqual({ ok: true });
  });
});
