const { getMockData, resetMockData, startServer } = require("../mock-server/server");

describe("mock-server payments", () => {
  let server;
  let baseUrl;

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { status: response.status, body };
  }

  async function createWalletOrder(token = "mock-user-token-001") {
    const created = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet_mock",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "pending",
      }),
    });

    expect(created.status).toBe(200);
    return created.body.data;
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
  });

  it("normalizes legacy seed orders and augments order reads with payment fields", async () => {
    const normalizedOrders = getMockData().orders;
    expect(normalizedOrders.find((order) => order._id === "order004")).toEqual(
      expect.objectContaining({
        payment_type: "wallet_mock",
        payment_status: "paid",
      })
    );
    expect(normalizedOrders.find((order) => order._id === "order001")).toEqual(
      expect.objectContaining({
        payment_type: "cod",
        payment_status: "pending",
      })
    );

    const orders = await request("/orders", {
      headers: { "x-auth-token": "mock-user-token-001" },
    });
    expect(orders.status).toBe(200);
    expect(orders.body.data[0]).toEqual(
      expect.objectContaining({
        payment_type: expect.any(String),
        payment_status: expect.any(String),
        payment_status_updated_at: expect.any(String),
      })
    );
  });

  it("creates COD and wallet orders with pending payment status", async () => {
    const codOrder = await request("/checkout", {
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
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "pending",
      }),
    });

    expect(codOrder.status).toBe(200);
    expect(codOrder.body.data).toEqual(
      expect.objectContaining({
        payment_type: "cod",
        payment_status: "pending",
        payment_failure_reason: null,
      })
    );

    const walletOrder = await createWalletOrder();
    expect(walletOrder).toEqual(
      expect.objectContaining({
        payment_type: "wallet_mock",
        payment_status: "pending",
        payment_failure_reason: null,
      })
    );
  });

  it("finalizes wallet payments as paid and rejects conflicting rewrites", async () => {
    const walletOrder = await createWalletOrder();

    const paid = await request(`/update-order-payment?id=${walletOrder._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    expect(paid.status).toBe(200);
    expect(paid.body.data.payment_status).toBe("paid");

    const idempotentRetry = await request(`/update-order-payment?id=${walletOrder._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    expect(idempotentRetry.status).toBe(200);
    expect(idempotentRetry.body.data.payment_status).toBe("paid");

    const conflictingRewrite = await request(`/update-order-payment?id=${walletOrder._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        payment_status: "failed",
        payment_failure_reason: "declined",
      }),
    });
    expect(conflictingRewrite.status).toBe(409);
  });

  it.each(["cancelled", "declined", "timeout"])(
    "finalizes wallet payments as failed for %s outcomes",
    async (failureReason) => {
      const walletOrder = await createWalletOrder();

      const failed = await request(`/update-order-payment?id=${walletOrder._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": "mock-user-token-001",
        },
        body: JSON.stringify({
          payment_status: "failed",
          payment_failure_reason: failureReason,
        }),
      });

      expect(failed.status).toBe(200);
      expect(failed.body.data).toEqual(
        expect.objectContaining({
          payment_status: "failed",
          payment_failure_reason: failureReason,
        })
      );
    }
  );

  it("enforces ownership and wallet-only payment transitions", async () => {
    const walletOrder = await createWalletOrder();

    const forbidden = await request(`/update-order-payment?id=${walletOrder._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-002",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    expect(forbidden.status).toBe(403);

    const codOrder = await request("/checkout", {
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
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
        status: "pending",
      }),
    });

    const codTransition = await request(`/update-order-payment?id=${codOrder.body.data._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({ payment_status: "paid" }),
    });
    expect(codTransition.status).toBe(409);
  });
});
