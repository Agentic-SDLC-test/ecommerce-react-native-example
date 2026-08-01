const calculateAggregates = (reviews) => {
  const visibleReviews = reviews.filter((r) => !r.hidden);
  const totalCount = visibleReviews.length;
  let sum = 0;
  let ratingDistribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

  visibleReviews.forEach((r) => {
    sum += r.rating;
    const rStr = String(Math.round(r.rating));
    if (ratingDistribution[rStr] !== undefined) {
      ratingDistribution[rStr]++;
    }
  });

  const averageRating = totalCount > 0 ? parseFloat((sum / totalCount).toFixed(1)) : 0;

  return { averageRating, totalCount, ratingDistribution };
};

describe("Product Reviews Calculations", () => {
  it("calculates correct average rating and total count with no reviews", () => {
    const reviews = [];
    const { averageRating, totalCount, ratingDistribution } = calculateAggregates(reviews);
    expect(totalCount).toBe(0);
    expect(averageRating).toBe(0);
    expect(ratingDistribution).toEqual({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 });
  });

  it("calculates correct average rating and distribution for typical reviews", () => {
    const reviews = [
      { rating: 5, hidden: false },
      { rating: 4, hidden: false },
      { rating: 5, hidden: false },
      { rating: 1, hidden: false },
    ];
    const { averageRating, totalCount, ratingDistribution } = calculateAggregates(reviews);
    expect(totalCount).toBe(4);
    expect(averageRating).toBe(3.8); // (5+4+5+1)/4 = 15/4 = 3.75 -> 3.8
    expect(ratingDistribution).toEqual({ "1": 1, "2": 0, "3": 0, "4": 1, "5": 2 });
  });

  it("ignores hidden reviews in aggregates", () => {
    const reviews = [
      { rating: 5, hidden: false },
      { rating: 4, hidden: true },
      { rating: 5, hidden: false },
    ];
    const { averageRating, totalCount, ratingDistribution } = calculateAggregates(reviews);
    expect(totalCount).toBe(2);
    expect(averageRating).toBe(5.0);
    expect(ratingDistribution).toEqual({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 2 });
  });
});
