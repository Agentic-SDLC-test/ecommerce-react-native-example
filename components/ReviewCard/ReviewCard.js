import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { colors } from "../../constants";
import StarRating from "../StarRating";

const ReviewCard = ({ review, testID, children }) => {
  const dateLabel = moment(review.edited ? review.updatedAt : review.createdAt).format(
    "MMM D, YYYY"
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <StarRating rating={review.rating} size={14} testID={testID ? `${testID}-stars` : undefined} />
        <Text style={styles.reviewerName} testID={testID ? `${testID}-reviewer` : undefined}>
          {review.reviewerName}
        </Text>
      </View>
      <View style={styles.badgeRow}>
        <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
        <Text style={styles.badgeText} testID={testID ? `${testID}-verified` : undefined}>
          Verified Purchase
        </Text>
        <Text style={styles.dateText} testID={testID ? `${testID}-date` : undefined}>
          {review.edited ? `Edited ${dateLabel}` : dateLabel}
        </Text>
      </View>
      {review.comment ? (
        <Text style={styles.commentText} testID={testID ? `${testID}-comment` : undefined}>
          {review.comment}
        </Text>
      ) : null}
      {children}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewerName: {
    fontWeight: "bold",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  dateText: {
    color: colors.muted,
    fontSize: 12,
    marginLeft: 10,
  },
  commentText: {
    marginTop: 8,
  },
});
