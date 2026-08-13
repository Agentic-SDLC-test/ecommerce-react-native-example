import React from "react";
import renderer, { act } from "react-test-renderer";
import ReviewStars from "../components/ReviewStars/ReviewStars";

describe("ReviewStars", () => {
  it("renders five stars in readonly mode", () => {
    const tree = renderer.create(
      <ReviewStars rating={3} readonly testID="review-stars" />
    );
    const instance = tree.root;
    expect(instance.findByProps({ testID: "review-stars-star-1" })).toBeTruthy();
    expect(instance.findByProps({ testID: "review-stars-star-5" })).toBeTruthy();
  });

  it("calls onChange when a star is pressed in interactive mode", () => {
    const onChange = jest.fn();
    const tree = renderer.create(
      <ReviewStars rating={0} onChange={onChange} testID="review-stars" />
    );
    const starFour = tree.root.findByProps({ testID: "review-stars-star-4" });
    act(() => {
      starFour.props.onPress();
    });
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
