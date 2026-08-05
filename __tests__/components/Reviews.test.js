import { REVIEWS_ENABLED } from "../../constants/Reviews";

describe("Review feature flag", () => {
  it("REVIEWS_ENABLED defaults to true when env is unset", () => {
    expect(REVIEWS_ENABLED).toBe(true);
  });
});
