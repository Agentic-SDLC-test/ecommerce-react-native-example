describe("order payment API seam", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("builds checkout and payment update routes with encoded query values", () => {
    jest.doMock("../api/client", () => ({
      get: jest.fn(),
      post: jest.fn(),
    }));

    const { post } = require("../api/client");
    const api = require("../api");

    api.checkout({ payment_type: "card" });
    api.updateOrderPaymentStatus("order/001", { payment_status: "payment_issue" });

    expect(post).toHaveBeenNthCalledWith(1, "/checkout", { payment_type: "card" });
    expect(post).toHaveBeenNthCalledWith(2, "/update-order-payment?id=order%2F001", {
      payment_status: "payment_issue",
    });
  });
});
