const {
  app,
  buildOrderPaymentFields,
  validatePaymentSelection,
} = require("../mock-server/server");

describe("mock server payment contract", () => {
  let server;
  let baseUrl;

  beforeAll((done) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it("defaults missing payment fields for legacy clients", () => {
    expect(buildOrderPaymentFields({})).toEqual({
      payment_type: "cod",
      payment_status: "awaiting_payment",
    });
  });

  it("rejects an invalid COD payment status", () => {
    expect(() =>
      validatePaymentSelection("cod", "paid", "user001")
    ).toThrow("Cash on Delivery orders must use awaiting_payment status");
  });

  it("stores the selected wallet payment metadata on checkout", async () => {
    const response = await fetch(`${baseUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet_mock",
        payment_status: "paid",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "pending",
      }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.payment_type).toBe("wallet_mock");
    expect(payload.data.payment_status).toBe("paid");
    expect(payload.data.status).toBe("pending");
  });

  it("returns a 400 for unsupported payment combinations", async () => {
    const response = await fetch(`${baseUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "cod",
        payment_status: "failed",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "pending",
      }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.message).toBe(
      "Cash on Delivery orders must use awaiting_payment status"
    );
  });
});
