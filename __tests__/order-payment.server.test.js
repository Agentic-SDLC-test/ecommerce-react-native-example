const { resetMockData, startServer } = require("../mock-server/server");

describe("mock-server order payments", () => {
  let server;
  let baseUrl;
  let consoleSpy;

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { status: response.status, body };
  }

  beforeAll(async () => {
    server = startServer({ port: 0, host: "127.0.0.1", silent: true });
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  });

  beforeEach(() => {
    resetMockData();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("hydrates payment status for legacy order reads", async () => {
    const shopperOrders = await request("/orders", {
      headers: { "x-auth-token": "mock-user-token-001" },
    });
    expect(shopperOrders.status).toBe(200);
    expect(shopperOrders.body.data.find((order) => order._id === "order001").payment_status).toBe(
      "due_on_delivery"
    );
    expect(shopperOrders.body.data.find((order) => order._id === "order004").payment_status).toBe(
      "paid"
    );

    const adminOrders = await request("/admin/orders", {
      headers: { "x-auth-token": "mock-admin-token-001" },
    });
    expect(adminOrders.status).toBe(200);
    expect(adminOrders.body.data.find((order) => order._id === "order006").payment_status).toBe(
      "paid"
    );
  });

  it("stores card demo orders with awaiting payment and logs checkout creation", async () => {
    const created = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 2 }],
        amount: 39.98,
        discount: 0,
        payment_type: "card",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "delivered",
      }),
    });

    expect(created.status).toBe(200);
    expect(created.body.data.payment_type).toBe("card");
    expect(created.body.data.payment_status).toBe("awaiting_payment");
    expect(created.body.data.status).toBe("pending");
    expect(consoleSpy).toHaveBeenCalledWith(
      "order.checkout_created",
      expect.objectContaining({
        paymentType: "card",
        paymentStatus: "awaiting_payment",
        deliveryStatus: "pending",
        userId: "user001",
      })
    );
  });

  it("updates card payment state and treats same-status writes as idempotent", async () => {
    const created = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod003", price: 89.99, quantity: 1 }],
        amount: 89.99,
        discount: 0,
        payment_type: "card",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
      }),
    });

    const updated = await request(`/update-order-payment?id=${created.body.data._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.payment_status).toBe("paid");
    expect(consoleSpy).toHaveBeenCalledWith(
      "order.payment_status_updated",
      expect.objectContaining({
        paymentType: "card",
        fromStatus: "awaiting_payment",
        toStatus: "paid",
      })
    );

    const repeated = await request(`/update-order-payment?id=${created.body.data._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });

    expect(repeated.status).toBe(200);
    expect(repeated.body.data.payment_status).toBe("paid");
  });

  it("rejects invalid payment update scenarios", async () => {
    const codUpdate = await request("/update-order-payment?id=order001", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    expect(codUpdate.status).toBe(400);

    const crossUser = await request("/update-order-payment?id=order006", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "payment_issue" }),
    });
    expect(crossUser.status).toBe(403);

    const invalidStatus = await request("/update-order-payment?id=order004", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "due_on_delivery" }),
    });
    expect(invalidStatus.status).toBe(400);

    const missing = await request("/update-order-payment?id=missing-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    expect(missing.status).toBe(404);
    expect(consoleSpy).toHaveBeenCalledWith(
      "order.payment_status_update_rejected",
      expect.objectContaining({ reason: "ORDER_NOT_FOUND" })
    );
  });
});
