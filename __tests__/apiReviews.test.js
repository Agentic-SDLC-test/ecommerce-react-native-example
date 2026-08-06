// Mocked so the seam suite never pulls in expo-secure-store / AsyncStorage or
// the navigation container.
jest.mock("../utils/session", () => ({
  getToken: jest.fn(() => Promise.resolve("mock-user-token-001")),
  clearSession: jest.fn(() => Promise.resolve()),
}));
jest.mock("../routes/navigationRef", () => ({
  resetToLogin: jest.fn(),
}));

import * as api from "../api";

const originalFetch = global.fetch;

// The single request fetch received, with its headers flattened.
const lastCall = () => {
  const [url, options] = global.fetch.mock.calls[0];
  const headers = {};
  if (options?.headers) {
    options.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
  }
  return { url, options, headers };
};

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ success: true }) })
  );
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe("getProductReviews", () => {
  it("GETs the review read endpoint for the product", async () => {
    await api.getProductReviews("prod003");
    const { url, options } = lastCall();
    expect(options.method).toBe("GET");
    expect(url).toContain("/reviews?productId=prod003");
  });

  it("URL-encodes the product id", async () => {
    await api.getProductReviews("prod 003&x=1");
    expect(lastCall().url).toContain("/reviews?productId=prod%20003%26x%3D1");
  });

  it("attaches the auth token so the server can report viewer context", async () => {
    await api.getProductReviews("prod003");
    expect(lastCall().headers["x-auth-token"]).toBe("mock-user-token-001");
  });
});

describe("submitReview", () => {
  it("POSTs productId, rating and comment as JSON", async () => {
    await api.submitReview("prod003", 4, "Good value.");
    const { url, options, headers } = lastCall();
    expect(options.method).toBe("POST");
    expect(url).toContain("/review");
    expect(headers["content-type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      productId: "prod003",
      rating: 4,
      comment: "Good value.",
    });
  });

  it("attaches the auth token", async () => {
    await api.submitReview("prod003", 5, "");
    expect(lastCall().headers["x-auth-token"]).toBe("mock-user-token-001");
  });
});

describe("deleteReview", () => {
  it("GETs the delete endpoint with the review id", async () => {
    await api.deleteReview("rev001");
    const { url, options } = lastCall();
    expect(options.method).toBe("GET");
    expect(url).toContain("/delete-review?id=rev001");
  });
});

describe("getAdminReviews", () => {
  it("GETs the admin review list", async () => {
    await api.getAdminReviews();
    const { url, options } = lastCall();
    expect(options.method).toBe("GET");
    expect(url).toContain("/admin/reviews");
  });
});

describe("setReviewVisibility", () => {
  it("sends visible=false when hiding", async () => {
    await api.setReviewVisibility("rev007", false);
    const { url, options } = lastCall();
    expect(options.method).toBe("GET");
    expect(url).toContain("/admin/review-visibility?reviewId=rev007&visible=false");
  });

  it("sends visible=true when unhiding", async () => {
    await api.setReviewVisibility("rev007", true);
    expect(lastCall().url).toContain(
      "/admin/review-visibility?reviewId=rev007&visible=true"
    );
  });
});
