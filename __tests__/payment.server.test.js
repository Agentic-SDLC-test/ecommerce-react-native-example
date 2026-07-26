/* eslint-env jest, node */
/* global Buffer */

const http = require("http");
const { app, resetMockData, __testing } = require("../mock-server/server");

const requestJson = ({ server, method, path, token, body }) =>
  new Promise((resolve, reject) => {
    const address = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method,
        headers: {
          ...(token ? { "x-auth-token": token } : {}),
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {},
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });

describe("mock server payment contract", () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, "127.0.0.1", done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    resetMockData();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("hydrates legacy orders and delivered cod as paid", async () => {
    const response = await requestJson({
      server,
      method: "GET",
      path: "/orders",
      token: "mock-user-token-001",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: "order001",
          payment_type: "cod",
          payment_status: "pending",
        }),
        expect.objectContaining({
          _id: "order003",
          payment_type: "cod",
          payment_status: "paid",
        }),
      ])
    );
  });

  it("creates both cod and wallet checkout orders with pending payment state", async () => {
    const basePayload = {
      items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
      amount: 19.99,
      discount: 0,
      country: "Canada",
      city: "Toronto",
      zipcode: "M5V 3A8",
      shippingAddress: "123 Main Street",
    };

    const codResponse = await requestJson({
      server,
      method: "POST",
      path: "/checkout",
      token: "mock-user-token-001",
      body: {
        ...basePayload,
        payment_type: "cod",
      },
    });
    const walletResponse = await requestJson({
      server,
      method: "POST",
      path: "/checkout",
      token: "mock-user-token-001",
      body: {
        ...basePayload,
        payment_type: "wallet",
      },
    });

    expect(codResponse.body.data).toEqual(
      expect.objectContaining({
        payment_type: "cod",
        payment_status: "pending",
        status: "pending",
      })
    );
    expect(walletResponse.body.data).toEqual(
      expect.objectContaining({
        payment_type: "wallet",
        payment_status: "pending",
        status: "pending",
      })
    );
  });

  it("rejects invalid payment types during checkout", async () => {
    const response = await requestJson({
      server,
      method: "POST",
      path: "/checkout",
      token: "mock-user-token-001",
      body: {
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "card",
      },
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid payment type");
  });

  it("updates wallet payment status for the owning shopper", async () => {
    const checkoutResponse = await requestJson({
      server,
      method: "POST",
      path: "/checkout",
      token: "mock-user-token-001",
      body: {
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
      },
    });
    const orderId = checkoutResponse.body.data._id;

    const response = await requestJson({
      server,
      method: "POST",
      path: `/order-payment-status?orderId=${orderId}`,
      token: "mock-user-token-001",
      body: {
        payment_status: "paid",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("payment status updated");
    expect(response.body.data).toEqual(
      expect.objectContaining({
        payment_type: "wallet",
        payment_status: "paid",
        status: "pending",
      })
    );
  });

  it("rejects invalid payment update branches", async () => {
    const walletCheckout = await requestJson({
      server,
      method: "POST",
      path: "/checkout",
      token: "mock-user-token-001",
      body: {
        items: [{ productId: "prod001", price: 19.99, quantity: 1 }],
        amount: 19.99,
        discount: 0,
        payment_type: "wallet",
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
      },
    });
    const walletOrderId = walletCheckout.body.data._id;

    await requestJson({
      server,
      method: "POST",
      path: `/order-payment-status?orderId=${walletOrderId}`,
      token: "mock-user-token-001",
      body: {
        payment_status: "paid",
      },
    });

    const invalidTransition = await requestJson({
      server,
      method: "POST",
      path: `/order-payment-status?orderId=${walletOrderId}`,
      token: "mock-user-token-001",
      body: {
        payment_status: "failed",
      },
    });
    const notOwner = await requestJson({
      server,
      method: "POST",
      path: `/order-payment-status?orderId=${walletOrderId}`,
      token: "mock-user-token-002",
      body: {
        payment_status: "paid",
      },
    });
    const notFound = await requestJson({
      server,
      method: "POST",
      path: "/order-payment-status?orderId=missing",
      token: "mock-user-token-001",
      body: {
        payment_status: "paid",
      },
    });
    const invalidState = await requestJson({
      server,
      method: "POST",
      path: `/order-payment-status?orderId=${walletOrderId}`,
      token: "mock-user-token-001",
      body: {
        payment_status: "pending",
      },
    });

    expect(invalidTransition.status).toBe(400);
    expect(notOwner.status).toBe(403);
    expect(notFound.status).toBe(404);
    expect(invalidState.status).toBe(400);
  });

  it("marks delivered cod orders as paid in admin updates", async () => {
    const response = await requestJson({
      server,
      method: "GET",
      path: "/admin/order-status?orderId=order001&status=delivered",
      token: "mock-admin-token-001",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: "order001",
        status: "delivered",
        payment_status: "paid",
        payment_type: "cod",
      })
    );
  });

  it("keeps payment transition guards aligned with the spec", () => {
    expect(
      __testing.canTransitionPaymentStatus(
        {
          payment_type: "wallet",
          payment_status: "pending",
          status: "pending",
        },
        "failed"
      )
    ).toBe(true);
    expect(
      __testing.canTransitionPaymentStatus(
        {
          payment_type: "wallet",
          payment_status: "paid",
          status: "pending",
        },
        "failed"
      )
    ).toBe(false);
  });
});
