import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { format } from "date-fns";
import { colors } from "../../constants";
import StarRating from "./StarRating";

const ReviewList = ({ reviews = [], testID }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <View testID={testID}>
      {reviews.map((review, index) => (
        <View
          key={review._id || index}
          style={styles.reviewCard}
          testID={testID ? `${testID}-item-${index}` : undefined}
        >
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName} testID={testID ? `${testID}-name-${index}` : undefined}>
              {review.user?.name || "Anonymous"}
            </Text>
            {review.verifiedPurchase && (
              <View style={styles.verifiedBadge} testID={testID ? `${testID}-verified-${index}` : undefined}>
                <Text style={styles.verifiedText}>Verified Purchase</Text>
              </View>
            )}
          </View>
          <StarRating rating={review.rating} size={16} testID={testID ? `${testID}-stars-${index}` : undefined} />
          <Text style={styles.reviewDate} testID={testID ? `${testID}-date-${index}` : undefined}>
            {review.createdAt
              ? format(new Date(review.createdAt), "MMM d, yyyy")
              : ""}
          </Text>
          <Text style={styles.reviewBody} testID={testID ? `${testID}-body-${index}` : undefined}>
            {review.body}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.dark,
  },
  verifiedBadge: {
    backgroundColor: colors.primary_light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 6,
  },
  reviewBody: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
});
