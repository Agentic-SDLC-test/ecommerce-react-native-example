import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StarRating from "../components/StarRating";

describe("StarRating", () => {
  it("exposes an accessibility label when read-only", () => {
    const { getByLabelText } = render(<StarRating rating={3} testID="stars" />);
    expect(getByLabelText("Rated 3 out of 5")).toBeTruthy();
  });

  it("calls onChange with the pressed star's value when interactive", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<StarRating rating={0} onChange={onChange} testID="stars" />);

    fireEvent.press(getByTestId("stars-star-3"));

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
