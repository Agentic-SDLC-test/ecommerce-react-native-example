import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";
import StarRating from "../StarRating";
import ReviewCard from "../ReviewCard";

const STAR_LEVELS = [5, 4, 3, 2, 1];

const DistributionRow = ({ star, count, total, testID }) => {
  const width = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View style={styles.distRow} testID={testID}>
      <Text style={styles.distLabel}>{star}★</Text>
      <View style={styles.distBarTrack}>
        <View style={[styles.distBarFill, { width: `${width}%` }]} />
      </View>
      <Text style={styles.distCount}>{count}</Text>
    </View>
  );
};

const ReviewSection = ({
  summary,
  reviews,
  myReview,
  loadError,
  onWritePress,
  testID = "review-section",
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.heading} testID={`${testID}-heading`}>
        Reviews
      </Text>

      {loadError ? (
        <Text style={styles.mutedText} testID={`${testID}-error`}>
          Reviews are unavailable right now.
        </Text>
      ) : !summary || summary.count === 0 ? (
        <Text style={styles.mutedText} testID={`${testID}-empty`}>
          No reviews yet
        </Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.averageText} testID={`${testID}-average`}>
              {summary.average.toFixed(1)}
            </Text>
            <View>
              <StarRating rating={summary.average} testID={`${testID}-average-stars`} />
              <Text style={styles.mutedText} testID={`${testID}-count`}>
                {`Based on ${summary.count} rating${summary.count === 1 ? "" : "s"}`}
              </Text>
            </View>
          </View>
          <View style={styles.distributionContainer}>
            {STAR_LEVELS.map((star) => (
              <DistributionRow
                key={star}
                star={star}
                count={summary.distribution[String(star)]}
                total={summary.count}
                testID={`${testID}-dist-${star}`}
              />
            ))}
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.mutedText} testID={`${testID}-no-written`}>
              No written reviews yet
            </Text>
          ) : (
            reviews.map((review, index) => (
              <ReviewCard key={review._id} review={review} testID={`review-card-${index}`} />
            ))
          )}
        </>
      )}

      {myReview?.review ? (
        <>
          <CustomButton testID={`${testID}-write-btn`} text="Edit your review" onPress={onWritePress} />
          {!myReview.review.isVisible ? (
            <Text style={styles.mutedText} testID={`${testID}-hidden-notice`}>
              Your review is hidden by a moderator.
            </Text>
          ) : null}
        </>
      ) : myReview?.eligible ? (
        <CustomButton testID={`${testID}-write-btn`} text="Write a review" onPress={onWritePress} />
      ) : myReview ? (
        <Text style={styles.mutedText} testID={`${testID}-ineligible`}>
          You can review this product once your order for it has been delivered.
        </Text>
      ) : null}
    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mutedText: {
    color: colors.muted,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  averageText: {
    fontSize: 36,
    fontWeight: "bold",
    marginRight: 15,
  },
  distributionContainer: {
    marginBottom: 15,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distLabel: {
    width: 24,
    fontSize: 12,
  },
  distBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.light,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  distBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  distCount: {
    width: 24,
    fontSize: 12,
    textAlign: "right",
  },
});
