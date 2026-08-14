jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import {
  getAdminReviews,
  getProductReviewBundle,
  removeReview,
  saveReview,
  updateReviewVisibility,
} from "../api";
import { get, post } from "../api/client";

describe("Review API helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    get.mockResolvedValue({ success: true });
    post.mockResolvedValue({ success: true });
  });

  it("requires a product id for the shopper review bundle", async () => {
    await expect(getProductReviewBundle()).rejects.toThrow(
      "productId is required"
    );
  });

  it("builds the expected review helper paths", async () => {
    await getProductReviewBundle("prod001");
    await saveReview({ productId: "prod001", rating: 5, comment: "Great fit" });
    await getAdminReviews({
      productId: "prod001",
      visibility: "hidden",
      search: "john",
    });
    await updateReviewVisibility("rev001", "visible");
    await removeReview("rev001");

    expect(get).toHaveBeenNthCalledWith(
      1,
      "/product-reviews?productId=prod001"
    );
    expect(post).toHaveBeenCalledWith("/review", {
      productId: "prod001",
      rating: 5,
      comment: "Great fit",
    });
    expect(get).toHaveBeenNthCalledWith(
      2,
      "/admin/reviews?productId=prod001&visibility=hidden&search=john"
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      "/admin/review-visibility?id=rev001&visibility=visible"
    );
    expect(get).toHaveBeenNthCalledWith(4, "/admin/delete-review?id=rev001");
  });
});
