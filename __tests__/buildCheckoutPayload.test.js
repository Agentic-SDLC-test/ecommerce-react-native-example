import { buildCheckoutPayload } from "../utils/buildCheckoutPayload";

describe("buildCheckoutPayload", () => {
  const cart = [
    { _id: "prod001", price: 10, quantity: 2 },
    { _id: "prod002", price: 5, quantity: 1 },
  ];
  const address = {
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V",
    streetAddress: "123 Main",
  };

  it("builds COD pending payload", () => {
    const payload = buildCheckoutPayload(cart, address, "cod", "pending");
    expect(payload.payment_type).toBe("cod");
    expect(payload.payment_status).toBe("pending");
    expect(payload.amount).toBe(25);
    expect(payload.items).toHaveLength(2);
    expect(payload.shippingAddress).toBe("123 Main");
    expect(payload.status).toBe("pending");
  });

  it("builds wallet paid payload", () => {
    const payload = buildCheckoutPayload(cart, address, "wallet", "paid");
    expect(payload.payment_type).toBe("wallet");
    expect(payload.payment_status).toBe("paid");
  });
});
