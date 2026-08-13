import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import StarRatingDisplay from "./StarRatingDisplay";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

const ReviewCard = ({ review, testID }) => {
  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.reviewerName} testID={testID ? `${testID}-name` : undefined}>
          {review?.user?.name || "Anonymous"}
        </Text>
        {review?.verifiedPurchase && (
          <View style={styles.verifiedBadge} testID={testID ? `${testID}-verified` : undefined}>
            <Text style={styles.verifiedText}>Verified Purchase</Text>
          </View>
        )}
      </View>
      <StarRatingDisplay rating={review?.rating || 0} size={14} testID={testID ? `${testID}-stars` : undefined} />
      <Text style={styles.body} testID={testID ? `${testID}-body` : undefined}>
        {review?.body}
      </Text>
      <Text style={styles.date} testID={testID ? `${testID}-date` : undefined}>
        {formatDate(review?.createdAt)}
      </Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  verifiedBadge: {
    backgroundColor: colors.primary_light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "600",
  },
  body: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
  },
});
