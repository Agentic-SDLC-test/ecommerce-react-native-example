import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import WriteReviewScreen from "../screens/user/WriteReviewScreen";
import * as api from "../api";

jest.mock("../api", () => ({
  submitReview: jest.fn(),
}));

function renderScreen(review = null) {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };
  const route = { params: { product: { _id: "p1", title: "Organic Basmati Rice" }, review } };
  const utils = render(<WriteReviewScreen navigation={navigation} route={route} />);
  return { ...utils, navigation };
}

describe("WriteReviewScreen", () => {
  beforeEach(() => {
    api.submitReview.mockReset();
  });

  it("shows a validation error and does not call the API when no star is picked", async () => {
    const { getByTestId, getByText } = renderScreen();

    fireEvent.press(getByTestId("write-review-submit-btn"));

    await waitFor(() => expect(getByText("Please select a star rating")).toBeTruthy());
    expect(api.submitReview).not.toHaveBeenCalled();
  });

  it("submits the rating and comment, then navigates back on success", async () => {
    api.submitReview.mockResolvedValue({ success: true, data: {} });
    const { getByTestId, navigation } = renderScreen();

    fireEvent.press(getByTestId("write-review-stars-star-4"));
    fireEvent.changeText(getByTestId("write-review-comment"), "Nice");
    fireEvent.press(getByTestId("write-review-submit-btn"));

    await waitFor(() => expect(api.submitReview).toHaveBeenCalledWith("p1", 4, "Nice"));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
  });

  it("shows the server message when the submission fails", async () => {
    api.submitReview.mockResolvedValue({ success: false, message: "Only customers with a delivered order for this product can review it" });
    const { getByTestId, getByText } = renderScreen();

    fireEvent.press(getByTestId("write-review-stars-star-5"));
    fireEvent.press(getByTestId("write-review-submit-btn"));

    await waitFor(() =>
      expect(
        getByText("Only customers with a delivered order for this product can review it")
      ).toBeTruthy()
    );
  });
});
