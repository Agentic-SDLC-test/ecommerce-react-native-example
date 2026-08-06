import {
  SIMULATED_CARD,
  SIMULATION_OUTCOMES,
  simulateCardPayment,
} from "../utils/paymentSimulator";

describe("simulateCardPayment", () => {
  it("approves with a well-formed reference", async () => {
    const result = await simulateCardPayment({
      amount: 129.97,
      outcome: SIMULATION_OUTCOMES.APPROVE,
      delayMs: 0,
    });

    expect(result.result).toBe("approved");
    expect(result.reference).toMatch(/^SIMPAY-\d+-[A-Z0-9]{4}$/);
    expect(result.message).toBeTruthy();
  });

  it("defaults to approve when no outcome is given", async () => {
    const result = await simulateCardPayment({ amount: 10, delayMs: 0 });
    expect(result.result).toBe("approved");
  });

  it("declines with no reference and a shopper-facing message", async () => {
    const result = await simulateCardPayment({
      amount: 129.97,
      outcome: SIMULATION_OUTCOMES.DECLINE,
      delayMs: 0,
    });

    expect(result.result).toBe("declined");
    expect(result.reference).toBeNull();
    expect(result.message).toMatch(/No money has been taken/);
  });

  it("produces a different reference on every approval", async () => {
    const first = await simulateCardPayment({ amount: 10, delayMs: 0 });
    const second = await simulateCardPayment({ amount: 10, delayMs: 0 });

    expect(first.reference).not.toBe(second.reference);
  });

  it("resolves with exactly result, reference and message", async () => {
    const result = await simulateCardPayment({ amount: 10, delayMs: 0 });

    expect(Object.keys(result).sort()).toEqual([
      "message",
      "reference",
      "result",
    ]);
  });

  it("rejects a zero or negative amount", async () => {
    await expect(
      simulateCardPayment({ amount: 0, delayMs: 0 })
    ).rejects.toThrow("Payment amount must be greater than zero");
    await expect(
      simulateCardPayment({ amount: -5, delayMs: 0 })
    ).rejects.toThrow("Payment amount must be greater than zero");
    await expect(
      simulateCardPayment({ amount: undefined, delayMs: 0 })
    ).rejects.toThrow("Payment amount must be greater than zero");
  });

  it("rejects an unknown outcome", async () => {
    await expect(
      simulateCardPayment({ amount: 10, outcome: "maybe", delayMs: 0 })
    ).rejects.toThrow("Unknown simulation outcome: maybe");
  });

  it("never returns any card detail", async () => {
    const result = await simulateCardPayment({ amount: 10, delayMs: 0 });
    const serialised = JSON.stringify(result);

    expect(serialised).not.toMatch(/4242/);
    expect(serialised).not.toMatch(/VISA/);
    expect(serialised).not.toMatch(/12\/34/);
  });
});

describe("SIMULATED_CARD", () => {
  it("is display-only test data, frozen so it cannot be repurposed", () => {
    expect(Object.isFrozen(SIMULATED_CARD)).toBe(true);
    expect(SIMULATED_CARD.number).toBe("4242 4242 4242 4242");
    expect(SIMULATED_CARD.cvc).toBe("***");
  });
});
