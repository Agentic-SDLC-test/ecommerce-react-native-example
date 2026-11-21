import { simulateCardPayment, isFailingTestCard } from "../utils/paymentSimulator";

describe("paymentSimulator", () => {
  it("succeeds with a reference", async () => {
    const result = await simulateCardPayment({ amount: 10, delayMs: 0 });
    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^SIM-/);
  });
  it("fails when forced", async () => {
    const result = await simulateCardPayment({ amount: 10, forceFail: true, delayMs: 0 });
    expect(result).toEqual({
      success: false,
      message: "Payment declined (demo). Try again or choose Cash On Delivery.",
    });
  });
  it("recognises the failing test card", () => {
    expect(isFailingTestCard("4000 0000 0000 0002")).toBe(true);
    expect(isFailingTestCard("4242424242424242")).toBe(false);
    expect(isFailingTestCard(undefined)).toBe(false);
  });
});
