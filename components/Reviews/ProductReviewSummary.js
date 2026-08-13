import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../constants";
import StarRatingDisplay from "./StarRatingDisplay";
import RatingDistribution from "./RatingDistribution";
import ReviewCard from "./ReviewCard";
import CustomButton from "../CustomButton";

const ProductReviewSummary = ({
  summary,
  reviews,
  onWriteReview,
  eligibility,
  testID,
}) => {
  const totalCount = summary?.totalCount || 0;
  const averageRating = summary?.averageRating || 0;
  const hasReviews = totalCount > 0;

  const getButtonLabel = () => {
    if (eligibility?.existingReview) return "Edit Your Review";
    if (eligibility?.eligible) return "Write a Review";
    return null;
  };

  const buttonLabel = getButtonLabel();
  const ineligibleReason =
    eligibility && !eligibility.eligible ? eligibility.reason : null;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle} testID={testID ? `${testID}-title` : undefined}>
        Reviews
      </Text>

      {hasReviews ? (
        <>
          <View style={styles.summaryRow}>
            <StarRatingDisplay
              rating={averageRating}
              size={20}
              testID={testID ? `${testID}-avg-stars` : undefined}
            />
            <Text style={styles.averageText} testID={testID ? `${testID}-avg` : undefined}>
              {averageRating.toFixed(1)}
            </Text>
            <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
              ({totalCount} {totalCount === 1 ? "review" : "reviews"})
            </Text>
          </View>
          <RatingDistribution
            distribution={summary?.distribution}
            totalCount={totalCount}
            testID={testID ? `${testID}-distribution` : undefined}
          />
          {reviews?.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              testID={testID ? `${testID}-card-${review._id}` : undefined}
            />
          ))}
        </>
      ) : (
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews yet
        </Text>
      )}

      {buttonLabel && (
        <View style={styles.ctaContainer}>
          <CustomButton
            text={buttonLabel}
            onPress={onWriteReview}
            testID={testID ? `${testID}-write-btn` : undefined}
          />
        </View>
      )}

      {ineligibleReason && !buttonLabel && (
        <Text style={styles.ineligibleText} testID={testID ? `${testID}-ineligible` : undefined}>
          {ineligibleReason}
        </Text>
      )}
    </View>
  );
};

export default ProductReviewSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  averageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginLeft: 8,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginLeft: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
    marginVertical: 8,
  },
  ctaContainer: {
    marginTop: 12,
    width: "100%",
  },
  ineligibleText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    fontStyle: "italic",
  },
});
