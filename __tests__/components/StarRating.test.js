import React from "react";
import renderer, { act } from "react-test-renderer";
import StarRating from "../../components/Reviews/StarRating";

describe("StarRating", () => {
  it("renders 5 star elements", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <StarRating rating={3} testID="stars" />
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("stars-star-1");
    expect(json).toContain("stars-star-5");
  });
});
