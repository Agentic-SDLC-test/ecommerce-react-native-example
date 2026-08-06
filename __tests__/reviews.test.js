import {
  RATING_REQUIRED_MESSAGE,
  REVIEW_COMMENT_MAX_LENGTH,
  REVIEW_PAGE_SIZE,
  areReviewsEnabled,
  clampComment,
  formatAverage,
  formatReviewDate,
  isValidRating,
  isVerifiedPurchase,
  remainingCommentChars,
  reviewCountLabel,
  starIconName,
  starStates,
} from "../utils/reviews";

describe("formatAverage", () => {
  it("renders a whole average to one decimal place", () => {
    expect(formatAverage(4)).toBe("4.0");
  });

  it("rounds to one decimal place", () => {
    expect(formatAverage(4.25)).toBe("4.3");
    expect(formatAverage(4.333333)).toBe("4.3");
  });

  it("returns an empty string when there is no average to show", () => {
    expect(formatAverage(null)).toBe("");
    expect(formatAverage(undefined)).toBe("");
    expect(formatAverage("not a number")).toBe("");
  });
});

describe("starStates", () => {
  it("maps a half value to three full, one half and one empty star", () => {
    expect(starStates(3.5)).toEqual(["full", "full", "full", "half", "empty"]);
  });

  it("maps zero to five empty stars", () => {
    expect(starStates(0)).toEqual([
      "empty",
      "empty",
      "empty",
      "empty",
      "empty",
    ]);
  });

  it("maps a full score to five full stars", () => {
    expect(starStates(5)).toEqual(["full", "full", "full", "full", "full"]);
  });

  it("treats a non-numeric value as zero", () => {
    expect(starStates(undefined)).toEqual([
      "empty",
      "empty",
      "empty",
      "empty",
      "empty",
    ]);
  });
});

describe("starIconName", () => {
  it("maps each state to its Ionicons name", () => {
    expect(starIconName("full")).toBe("star");
    expect(starIconName("half")).toBe("star-half");
    expect(starIconName("empty")).toBe("star-outline");
  });
});

describe("isValidRating", () => {
  it("accepts whole stars from 1 to 5", () => {
    [1, 2, 3, 4, 5].forEach((rating) => {
      expect(isValidRating(rating)).toBe(true);
    });
  });

  it("rejects out-of-range, fractional, string and empty ratings", () => {
    [0, 6, 2.5, "3", null, undefined].forEach((rating) => {
      expect(isValidRating(rating)).toBe(false);
    });
  });
});

describe("isVerifiedPurchase", () => {
  it("earns a badge only on an explicit true", () => {
    expect(isVerifiedPurchase({ verifiedPurchase: true })).toBe(true);
  });

  it("fails closed for a false, missing or truthy-but-not-true flag", () => {
    [
      { verifiedPurchase: false },
      { verifiedPurchase: "true" },
      {},
      null,
      undefined,
    ].forEach((review) => {
      expect(isVerifiedPurchase(review)).toBe(false);
    });
  });
});

describe("RATING_REQUIRED_MESSAGE", () => {
  it("is a non-empty message that names the missing rating", () => {
    expect(typeof RATING_REQUIRED_MESSAGE).toBe("string");
    expect(RATING_REQUIRED_MESSAGE.length).toBeGreaterThan(0);
    expect(RATING_REQUIRED_MESSAGE.toLowerCase()).toContain("rating");
  });
});

describe("clampComment", () => {
  it("truncates at the comment cap", () => {
    expect(clampComment("x".repeat(700))).toHaveLength(
      REVIEW_COMMENT_MAX_LENGTH
    );
  });

  it("leaves a short comment untouched", () => {
    expect(clampComment("Good value.")).toBe("Good value.");
  });

  it("returns an empty string for a missing comment", () => {
    expect(clampComment(null)).toBe("");
    expect(clampComment(undefined)).toBe("");
  });
});

describe("remainingCommentChars", () => {
  it("counts down from the cap", () => {
    expect(remainingCommentChars("")).toBe(REVIEW_COMMENT_MAX_LENGTH);
    expect(remainingCommentChars("abc")).toBe(REVIEW_COMMENT_MAX_LENGTH - 3);
  });

  it("never goes negative", () => {
    expect(remainingCommentChars("x".repeat(900))).toBe(0);
  });
});

describe("reviewCountLabel", () => {
  it("uses the singular for one rating", () => {
    expect(reviewCountLabel(1)).toBe("1 rating");
  });

  it("uses the plural for many ratings", () => {
    expect(reviewCountLabel(12)).toBe("12 ratings");
  });

  it("reports no ratings for zero", () => {
    expect(reviewCountLabel(0)).toBe("No ratings");
  });
});

describe("formatReviewDate", () => {
  it("formats as two-digit day, two-digit month and four-digit year", () => {
    // Build the expectation from a Date instance so the assertion holds in
    // any timezone, exactly like the OrderList helper it mirrors.
    const iso = "2024-02-04T09:12:00.000Z";
    const t = new Date(iso);
    const expected = `${("0" + t.getDate()).slice(-2)}-${(
      "0" +
      (t.getMonth() + 1)
    ).slice(-2)}-${t.getFullYear()}`;
    expect(formatReviewDate(iso)).toBe(expected);
    expect(formatReviewDate(iso)).toMatch(/^\d{2}-\d{2}-\d{4}$/);
  });

  it("returns an empty string for a missing or unparseable date", () => {
    expect(formatReviewDate(null)).toBe("");
    expect(formatReviewDate("not a date")).toBe("");
  });
});

describe("areReviewsEnabled", () => {
  const original = process.env.EXPO_PUBLIC_REVIEWS_ENABLED;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.EXPO_PUBLIC_REVIEWS_ENABLED;
    } else {
      process.env.EXPO_PUBLIC_REVIEWS_ENABLED = original;
    }
  });

  it("defaults to enabled when the variable is unset", () => {
    delete process.env.EXPO_PUBLIC_REVIEWS_ENABLED;
    expect(areReviewsEnabled()).toBe(true);
  });

  it("is enabled for an explicit true", () => {
    process.env.EXPO_PUBLIC_REVIEWS_ENABLED = "true";
    expect(areReviewsEnabled()).toBe(true);
  });

  it("is disabled only for the literal string false", () => {
    process.env.EXPO_PUBLIC_REVIEWS_ENABLED = "false";
    expect(areReviewsEnabled()).toBe(false);
  });
});

describe("review constants", () => {
  it("caps comments at 500 characters and reveals reviews five at a time", () => {
    expect(REVIEW_COMMENT_MAX_LENGTH).toBe(500);
    expect(REVIEW_PAGE_SIZE).toBe(5);
  });
});
