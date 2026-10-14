import { Alert, Platform } from "react-native";
import { confirmAction } from "../utils/confirm";

describe("confirmAction", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.window;
  });

  it("resolves true when the destructive button is pressed (native)", async () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
      const destructive = buttons.find((b) => b.style === "destructive");
      destructive.onPress();
    });

    await expect(
      confirmAction({ title: "Remove review", message: "Sure?" })
    ).resolves.toBe(true);
  });

  it("resolves false when cancel is pressed (native)", async () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
      const cancel = buttons.find((b) => b.style === "cancel");
      cancel.onPress();
    });

    await expect(
      confirmAction({ title: "Remove review", message: "Sure?" })
    ).resolves.toBe(false);
  });

  it("uses window.confirm on web", async () => {
    Platform.OS = "web";
    global.window = { confirm: jest.fn(() => true) };

    const result = await confirmAction({
      title: "Remove review",
      message: "This permanently deletes the review.",
    });

    expect(result).toBe(true);
    expect(global.window.confirm).toHaveBeenCalledWith(
      "Remove review: This permanently deletes the review."
    );
  });
});
