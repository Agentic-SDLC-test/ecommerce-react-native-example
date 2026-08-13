import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import ReviewStars from "../ReviewStars/ReviewStars";

const ReviewListItem = ({
  review,
  admin = false,
  onToggleVisibility,
  onDelete,
  testID,
}) => {
  const productTitle = review.product?.title || review.productTitle;
  const displayDate = review.updatedAt
    ? new Date(review.updatedAt).toLocaleDateString()
    : "";

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.userName} testID={testID ? `${testID}-user` : undefined}>
          {review.user?.name || "Anonymous"}
        </Text>
        {review.verifiedPurchase && (
          <Text style={styles.verifiedBadge} testID={testID ? `${testID}-verified` : undefined}>
            Verified Purchase
          </Text>
        )}
        {admin && review.visible === false && (
          <Text style={styles.hiddenBadge} testID={testID ? `${testID}-hidden` : undefined}>
            Hidden
          </Text>
        )}
      </View>
      {admin && productTitle ? (
        <Text style={styles.productTitle} testID={testID ? `${testID}-product` : undefined}>
          {productTitle}
        </Text>
      ) : null}
      <ReviewStars rating={review.rating} readonly size={14} testID={testID ? `${testID}-stars` : undefined} />
      {review.comment ? (
        <Text style={styles.comment} testID={testID ? `${testID}-comment` : undefined}>
          {review.comment}
        </Text>
      ) : null}
      <Text style={styles.date} testID={testID ? `${testID}-date` : undefined}>
        {displayDate}
      </Text>
      {admin && (
        <View style={styles.adminActions}>
          {review.visible ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onToggleVisibility && onToggleVisibility(review._id, false)}
              testID={testID ? `${testID}-hide-btn` : undefined}
            >
              <Ionicons name="eye-off-outline" size={18} color={colors.muted} />
              <Text style={styles.actionText}>Hide</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onToggleVisibility && onToggleVisibility(review._id, true)}
              testID={testID ? `${testID}-show-btn` : undefined}
            >
              <Ionicons name="eye-outline" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Show</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete && onDelete(review._id)}
            testID={testID ? `${testID}-remove-btn` : undefined}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReviewListItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
    marginRight: 8,
  },
  hiddenBadge: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
    fontStyle: "italic",
  },
  productTitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  comment: {
    fontSize: 13,
    color: colors.dark,
    marginTop: 6,
  },
  date: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
  },
  adminActions: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    fontSize: 13,
    marginLeft: 4,
    color: colors.muted,
  },
});
