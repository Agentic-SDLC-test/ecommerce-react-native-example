import { format } from "date-fns";
import { ReviewEligibility } from "@agentic-sdlc-test/easybuy-api-client/domain";

// method to format the average rating to one decimal place, '' when there is none
export function formatAverage(average) {
  if (average == null) return "";
  return Number(average).toFixed(1);
}

// method to shape a 5-to-1 star distribution with per-level counts and percentages
export function distributionRows(summary) {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = summary?.distribution?.[stars] || 0;
    const percent = summary?.count
      ? Math.round((count / summary.count) * 100)
      : 0;
    return { stars, count, percent };
  });
}

// method to map an eligibility value to the message shown to the customer
export function eligibilityMessage(eligibility) {
  if (eligibility === ReviewEligibility.NOT_DELIVERED) {
    return "You can review this product once your order is delivered.";
  }
  if (eligibility === ReviewEligibility.NOT_PURCHASED) {
    return "Only customers who have received this product can review it.";
  }
  return "";
}

// method to format a review's postedAt timestamp for display
export function formatReviewDate(iso) {
  if (!iso) return "";
  return format(new Date(iso), "MMM d, yyyy");
}

// method to pluralize the review count label
export function reviewCountLabel(count) {
  return `${count}${count === 1 ? " review" : " reviews"}`;
}
