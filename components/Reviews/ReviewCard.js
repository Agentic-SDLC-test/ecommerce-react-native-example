import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import RatingStars from "./RatingStars";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ReviewCard = ({ review, showModerationState = false, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.userName} testID={testID ? `${testID}-name` : undefined}>
          {review.userName}
        </Text>
        <RatingStars rating={review.rating} readonly size={14} testID={testID ? `${testID}-stars` : undefined} />
      </View>
      {review.verifiedPurchase && (
        <Text style={styles.verifiedBadge} testID={testID ? `${testID}-verified` : undefined}>
          Verified Purchase
        </Text>
      )}
      {showModerationState && !review.visible && (
        <Text style={styles.hiddenLabel} testID={testID ? `${testID}-hidden` : undefined}>
          Hidden
        </Text>
      )}
      <Text style={styles.reviewText} testID={testID ? `${testID}-text` : undefined}>
        {review.reviewText}
      </Text>
      <Text style={styles.dateText} testID={testID ? `${testID}-date` : undefined}>
        {formatDate(review.updatedAt || review.createdAt)}
      </Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  verifiedBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  hiddenLabel: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 11,
    color: colors.muted,
  },
});
