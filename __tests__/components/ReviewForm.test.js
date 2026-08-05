import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewForm from "../../components/Reviews/ReviewForm";

describe("ReviewForm", () => {
  it("shows disabled message when canReview is false", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewForm
          canReview={false}
          initialReview={null}
          onSubmit={jest.fn()}
          testID="review-form"
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("Purchase this product to leave a review");
  });

  it("prefills body for edit mode", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ReviewForm
          canReview={true}
          initialReview={{ rating: 4, body: "My existing review" }}
          onSubmit={jest.fn()}
          testID="review-form"
        />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("Edit your review");
    expect(json).toContain("My existing review");
  });
});
