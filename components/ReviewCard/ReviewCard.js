import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { formatReviewerName, formatReviewDate } from "../../utils/reviewHelper";
import RatingStars from "../RatingStars";

const ReviewCard = ({ review, testID, testIDPrefix = "product-detail-review", children }) => {
  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.username} testID={`${testIDPrefix}-username`}>
          {formatReviewerName(review.user?.name)}
        </Text>
        <Text style={styles.date} testID={`${testIDPrefix}-date`}>
          {formatReviewDate(review.createdAt)}
        </Text>
      </View>
      <RatingStars rating={review.rating} testID={`${testIDPrefix}-stars`} />
      <View style={styles.badgeRow}>
        {review.verifiedPurchase !== false ? (
          <View style={styles.badge} testID={`${testIDPrefix}-verified-badge`} accessibilityLabel="Verified Purchase">
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.badgeText}>Verified Purchase</Text>
          </View>
        ) : null}
        {review.edited ? (
          <Text style={styles.editedLabel} testID={`${testIDPrefix}-edited`}>
            Edited
          </Text>
        ) : null}
      </View>
      {review.comment ? (
        <Text style={styles.comment} testID={`${testIDPrefix}-comment`}>
          {review.comment}
        </Text>
      ) : null}
      {children}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  username: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  editedLabel: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
  },
  comment: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
});
