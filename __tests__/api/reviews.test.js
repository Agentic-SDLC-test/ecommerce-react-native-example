jest.mock("../../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { get, post } from "../../api/client";
import {
  getProductReviews,
  getMyReview,
  upsertReview,
  getAdminReviews,
  setReviewVisibility,
  deleteReview,
} from "../../api/index";

describe("Review API facade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getProductReviews calls correct path", async () => {
    get.mockResolvedValue({ success: true, data: {} });
    await getProductReviews("prod001");
    expect(get).toHaveBeenCalledWith("/products/prod001/reviews");
  });

  it("getMyReview calls correct path with encoded productId", async () => {
    get.mockResolvedValue({ success: true, data: {} });
    await getMyReview("prod001");
    expect(get).toHaveBeenCalledWith("/reviews/me?productId=prod001");
  });

  it("upsertReview posts rating and body", async () => {
    post.mockResolvedValue({ success: true, data: {} });
    const payload = { rating: 5, body: "Great product!" };
    await upsertReview("prod001", payload);
    expect(post).toHaveBeenCalledWith("/reviews?productId=prod001", payload);
  });

  it("getAdminReviews builds query params", async () => {
    get.mockResolvedValue({ success: true, data: [] });
    await getAdminReviews({ productId: "prod001", visibility: "hidden", search: "test" });
    expect(get).toHaveBeenCalledWith(
      "/admin/reviews?productId=prod001&visibility=hidden&search=test"
    );
  });

  it("getAdminReviews without filters", async () => {
    get.mockResolvedValue({ success: true, data: [] });
    await getAdminReviews();
    expect(get).toHaveBeenCalledWith("/admin/reviews");
  });

  it("setReviewVisibility posts visible flag", async () => {
    post.mockResolvedValue({ success: true, data: {} });
    await setReviewVisibility("rev001", false);
    expect(post).toHaveBeenCalledWith("/admin/review-visibility?id=rev001", {
      visible: false,
    });
  });

  it("deleteReview calls correct path", async () => {
    get.mockResolvedValue({ success: true, data: {} });
    await deleteReview("rev001");
    expect(get).toHaveBeenCalledWith("/admin/delete-review?id=rev001");
  });
});
