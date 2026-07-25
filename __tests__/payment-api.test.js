describe("payment API seam", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("builds the expected checkout and payment routes with encoded query values", () => {
    jest.doMock("../api/client", () => ({
      get: jest.fn(),
      post: jest.fn(),
    }));

    const { post } = require("../api/client");
    const api = require("../api");

    api.checkout({ payment_type: "wallet_mock" });
    api.updateOrderPayment("order/001", {
      payment_status: "failed",
      payment_failure_reason: "timeout",
    });

    expect(post).toHaveBeenNthCalledWith(1, "/checkout", {
      payment_type: "wallet_mock",
    });
    expect(post).toHaveBeenNthCalledWith(2, "/update-order-payment?id=order%2F001", {
      payment_status: "failed",
      payment_failure_reason: "timeout",
    });
  });

  it("automatically attaches x-auth-token for payment update requests", async () => {
    jest.resetModules();
    jest.unmock("../api/client");

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: true }),
    });
    global.fetch = fetchMock;

    jest.doMock("../utils/session", () => ({
      getToken: jest.fn().mockResolvedValue("session-token-123"),
      clearSession: jest.fn(),
    }));

    const { post } = require("../api/client");

    await post("/update-order-payment?id=order001", {
      payment_status: "paid",
    });

    const fetchOptions = fetchMock.mock.calls[0][1];
    expect(fetchOptions.headers.get("x-auth-token")).toBe("session-token-123");
  });
});
