import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RatingStars from "../components/Reviews/RatingStars";

describe("RatingStars", () => {
  it("renders five star buttons", () => {
    const { getByTestId } = render(
      <RatingStars rating={3} testID="rating-stars" />
    );
    expect(getByTestId("rating-stars-star-1")).toBeTruthy();
    expect(getByTestId("rating-stars-star-5")).toBeTruthy();
  });

  it("calls onChange when a star is pressed", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <RatingStars rating={0} onChange={onChange} testID="rating-stars" />
    );
    fireEvent.press(getByTestId("rating-stars-star-4"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("does not call onChange when read-only", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <RatingStars rating={3} testID="rating-stars" />
    );
    fireEvent.press(getByTestId("rating-stars-star-5"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
