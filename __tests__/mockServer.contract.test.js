/**
 * @jest-environment node
 */
/* global afterAll, beforeAll, beforeEach, describe, it, expect */

const { app, resetMockData } = require("../mock-server/server");

describe("mock-server wallet payment contract", () => {
  let server;
  let baseUrl;

  beforeAll((done) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      done();
    });
  });

  beforeEach(() => {
    resetMockData();
  });

  afterAll((done) => {
    server.close(done);
  });

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });

    return {
      status: response.status,
      body: await response.json(),
    };
  }

  it("includes payment fields in seeded shopper and admin order payloads", async () => {
    const shopperOrders = await request("/orders", {
      headers: { "x-auth-token": "mock-user-token-001" },
    });
    const adminOrders = await request("/admin/orders", {
      headers: { "x-auth-token": "mock-admin-token-001" },
    });

    expect(shopperOrders.status).toBe(200);
    expect(adminOrders.status).toBe(200);
    expect(shopperOrders.body.data[0]).toEqual(
      expect.objectContaining({
        payment_type: "cod",
        payment_status: "pay_on_delivery",
        payment_updated_at: expect.any(String),
      })
    );
    expect(adminOrders.body.data[0]).toEqual(
      expect.objectContaining({
        payment_status: "pay_on_delivery",
      })
    );
  });

  it("creates cod and wallet orders with the correct initial payment status", async () => {
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
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      }),
    });

    const walletOrder = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      }),
    });

    expect(codOrder.status).toBe(200);
    expect(walletOrder.status).toBe(200);
    expect(codOrder.body.data).toEqual(
      expect.objectContaining({
        status: "pending",
        payment_type: "cod",
        payment_status: "pay_on_delivery",
      })
    );
    expect(walletOrder.body.data).toEqual(
      expect.objectContaining({
        status: "pending",
        payment_type: "wallet",
        payment_status: "pending",
      })
    );
  });

  it("supports allowed wallet transitions and rejects illegal ones", async () => {
    const createOrder = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      }),
    });

    const orderId = createOrder.body.data._id;

    const paidOrder = await request("/order-payment-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        orderId,
        payment_status: "paid",
      }),
    });

    const illegalTransition = await request("/order-payment-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        orderId,
        payment_status: "failed",
      }),
    });

    const retrySource = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      }),
    });

    const failedOrder = await request("/order-payment-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        orderId: retrySource.body.data._id,
        payment_status: "failed",
      }),
    });

    const retryOrder = await request("/order-payment-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        orderId: retrySource.body.data._id,
        payment_status: "pending",
      }),
    });

    expect(paidOrder.status).toBe(200);
    expect(paidOrder.body.data.payment_status).toBe("paid");
    expect(illegalTransition.status).toBe(409);
    expect(illegalTransition.body.message).toBe("Invalid payment status transition");
    expect(failedOrder.status).toBe(200);
    expect(retryOrder.status).toBe(200);
    expect(retryOrder.body.data.payment_status).toBe("pending");
  });

  it("blocks admin shipping for unpaid wallet orders and keeps cod shipping unchanged", async () => {
    const walletOrder = await request("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "mock-user-token-001",
      },
      body: JSON.stringify({
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V",
        shippingAddress: "123 Main Street",
      }),
    });

    const blockedUpdate = await request(
      `/admin/order-status?orderId=${walletOrder.body.data._id}&status=shipped`,
      {
        headers: { "x-auth-token": "mock-admin-token-001" },
      }
    );

    const codUpdate = await request(
      "/admin/order-status?orderId=order001&status=shipped",
      {
        headers: { "x-auth-token": "mock-admin-token-001" },
      }
    );

    expect(blockedUpdate.status).toBe(409);
    expect(blockedUpdate.body.message).toBe(
      "Wallet orders must be paid before they can be shipped or delivered"
    );
    expect(codUpdate.status).toBe(200);
    expect(codUpdate.body.data.status).toBe("shipped");
  });
});
