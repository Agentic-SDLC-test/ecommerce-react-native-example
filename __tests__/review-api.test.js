describe("review API seam", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("builds the expected review routes with encoded query values", () => {
    jest.doMock("../api/client", () => ({
      get: jest.fn(),
      post: jest.fn(),
    }));

    const { get, post } = require("../api/client");
    const api = require("../api");

    api.getProductReviews("prod 001");
    api.createReview({ productId: "prod001" });
    api.updateReview("review/001", { rating: 5 });
    api.getAdminReviews();
    api.updateReviewStatus("review/001", "hidden");

    expect(get).toHaveBeenNthCalledWith(1, "/product-reviews?productId=prod%20001");
    expect(post).toHaveBeenNthCalledWith(1, "/review", { productId: "prod001" });
    expect(post).toHaveBeenNthCalledWith(2, "/update-review?id=review%2F001", {
      rating: 5,
    });
    expect(get).toHaveBeenNthCalledWith(2, "/admin/reviews");
    expect(get).toHaveBeenNthCalledWith(
      3,
      "/admin/review-status?id=review%2F001&status=hidden"
    );
  });

  it("automatically attaches x-auth-token for review requests", async () => {
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

    const { get } = require("../api/client");

    await get("/product-reviews?productId=prod001");

    const fetchOptions = fetchMock.mock.calls[0][1];
    expect(fetchOptions.headers.get("x-auth-token")).toBe("session-token-123");
  });
});
