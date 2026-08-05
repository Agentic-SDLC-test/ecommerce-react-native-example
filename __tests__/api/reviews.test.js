jest.mock("../../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { get, post } from "../../api/client";
import {
  getProductReviews,
  saveProductReview,
  getAdminReviews,
  setReviewVisibility,
  deleteReview,
} from "../../api/index";

describe("review API seam", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getProductReviews encodes productId", async () => {
    get.mockResolvedValue({ success: true });
    await getProductReviews("prod007");
    expect(get).toHaveBeenCalledWith("/product-reviews?productId=prod007");
  });

  it("saveProductReview posts payload", async () => {
    post.mockResolvedValue({ success: true });
    const payload = { rating: 5, reviewText: "Great" };
    await saveProductReview("prod007", payload);
    expect(post).toHaveBeenCalledWith("/review?productId=prod007", payload);
  });

  it("getAdminReviews builds visibility filter query", async () => {
    get.mockResolvedValue({ success: true });
    await getAdminReviews({ visibility: "hidden", productId: "prod007" });
    expect(get).toHaveBeenCalledWith(
      "/admin/reviews?productId=prod007&visibility=hidden"
    );
  });

  it("setReviewVisibility encodes id and visible flag", async () => {
    get.mockResolvedValue({ success: true });
    await setReviewVisibility("review001", false);
    expect(get).toHaveBeenCalledWith(
      "/admin/review-visibility?id=review001&visible=false"
    );
  });

  it("deleteReview encodes review id", async () => {
    get.mockResolvedValue({ success: true });
    await deleteReview("review001");
    expect(get).toHaveBeenCalledWith("/admin/delete-review?id=review001");
  });
});
