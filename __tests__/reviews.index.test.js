/* eslint-env jest */

jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import {
  getProductReviews,
  submitReview,
  updateReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from "../api";
import { get, post } from "../api/client";

describe("api reviews helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches the review summary and listing for a product", () => {
    getProductReviews("prod007");

    expect(get).toHaveBeenCalledWith("/reviews?productId=prod007");
  });

  it("submits a new review payload unchanged", () => {
    const payload = { productId: "prod007", rating: 5, text: "Great rice" };

    submitReview(payload);

    expect(post).toHaveBeenCalledWith("/reviews", payload);
  });

  it("updates a review by id with the flat endpoint contract", () => {
    const payload = { rating: 4, text: "Updated" };

    updateReview("review001", payload);

    expect(post).toHaveBeenCalledWith("/update-review?id=review001", payload);
  });

  it("lists admin reviews without filters", () => {
    getAdminReviews();

    expect(get).toHaveBeenCalledWith("/admin/reviews");
  });

  it("lists admin reviews filtered by productId and status", () => {
    getAdminReviews({ productId: "prod007", status: "hidden" });

    expect(get).toHaveBeenCalledWith("/admin/reviews?productId=prod007&status=hidden");
  });

  it("updates review status via the flat endpoint contract", () => {
    updateReviewStatus("review001", "hidden");

    expect(get).toHaveBeenCalledWith("/admin/review-status?reviewId=review001&status=hidden");
  });

  it("deletes a review by id", () => {
    deleteReview("review001");

    expect(get).toHaveBeenCalledWith("/admin/delete-review?id=review001");
  });
});
