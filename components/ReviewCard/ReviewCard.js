import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { colors } from "../../constants";

// Presentational review card. Renders in the shopper-facing recent-reviews
// feed by default; pass isAdmin + onModerate to render it in the admin
// moderation list with Hide/Unhide and Remove actions instead.
const ReviewCard = ({ review, isAdmin = false, onModerate, onRemove, testID }) => {
  const createdAgo = review?.createdAt
    ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
    : "";

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= review?.rating ? "star" : "star-outline"}
              size={16}
              color={colors.warning}
            />
          ))}
        </View>
        <Text style={styles.dateText} testID={testID ? `${testID}-date` : undefined}>
          {createdAgo}
        </Text>
      </View>
      <View style={styles.authorRow}>
        <Text style={styles.userNameText} testID={testID ? `${testID}-username` : undefined}>
          {review?.userName}
        </Text>
        <View style={styles.verifiedBadge} testID={testID ? `${testID}-verified-badge` : undefined}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.verifiedBadgeText}>Verified Purchase</Text>
        </View>
      </View>
      {review?.text ? (
        <Text style={styles.reviewText} testID={testID ? `${testID}-text` : undefined}>
          {review.text}
        </Text>
      ) : null}
      {isAdmin ? (
        <View style={styles.adminActionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => onModerate?.(review, review.status === "visible" ? "hidden" : "visible")}
            testID={testID ? `${testID}-toggle-btn` : undefined}
          >
            <MaterialIcons
              name={review?.status === "visible" ? "visibility-off" : "visibility"}
              size={15}
              color={colors.white}
            />
            <Text style={styles.actionButtonText}>
              {review?.status === "visible" ? "Hide" : "Unhide"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={() => onRemove?.(review)}
            testID={testID ? `${testID}-remove-btn` : undefined}
          >
            <MaterialIcons name="delete" size={15} color={colors.white} />
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsRow: {
    display: "flex",
    flexDirection: "row",
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  authorRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  userNameText: {
    fontWeight: "bold",
    marginRight: 8,
  },
  verifiedBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: colors.success,
    marginLeft: 3,
  },
  reviewText: {
    marginTop: 5,
  },
  adminActionsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
});
