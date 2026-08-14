import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
};

const renderStars = (rating) =>
  [1, 2, 3, 4, 5].map((star) => (
    <Ionicons
      key={star}
      name={star <= rating ? "star" : "star-outline"}
      size={16}
      color={colors.warning}
    />
  ));

const ActionButton = ({ text, type, onPress, testID }) => (
  <TouchableOpacity
    style={[styles.actionButton, styles[`actionButton_${type}`]]}
    onPress={onPress}
    testID={testID}
  >
    <Text style={styles.actionButtonText}>{text}</Text>
  </TouchableOpacity>
);

const ReviewListItem = ({
  review,
  mode = "shopper",
  onHide,
  onShow,
  onRemove,
  testID,
}) => {
  if (!review) return null;

  const isAdmin = mode === "admin";

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text
            style={styles.nameText}
            testID={testID ? `${testID}-name` : undefined}
          >
            {review.displayName}
          </Text>
          {isAdmin && review.userEmail ? (
            <Text
              style={styles.metaText}
              testID={testID ? `${testID}-email` : undefined}
            >
              {review.userEmail}
            </Text>
          ) : null}
        </View>
        {review.isVerifiedPurchase ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verified Purchase</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.ratingRow}>{renderStars(review.rating)}</View>

      <Text
        style={styles.commentText}
        testID={testID ? `${testID}-comment` : undefined}
      >
        {review.comment}
      </Text>

      <Text
        style={styles.metaText}
        testID={testID ? `${testID}-updated-at` : undefined}
      >
        Updated {formatDate(review.updatedAt)}
      </Text>

      {isAdmin ? (
        <>
          <View style={styles.adminMetaRow}>
            <Text
              style={styles.metaText}
              testID={testID ? `${testID}-product-title` : undefined}
            >
              {review.productTitle}
            </Text>
            <View style={styles.visibilityChip}>
              <Text
                style={styles.visibilityChipText}
                testID={testID ? `${testID}-visibility` : undefined}
              >
                {review.visibility}
              </Text>
            </View>
          </View>
          <Text
            style={styles.metaText}
            testID={testID ? `${testID}-order-id` : undefined}
          >
            Qualifying order: {review.qualifyingOrderId}
          </Text>
          <View style={styles.actionsRow}>
            {review.visibility === "visible" ? (
              <ActionButton
                text="Hide"
                type="muted"
                onPress={onHide}
                testID={testID ? `${testID}-hide-btn` : undefined}
              />
            ) : null}
            {review.visibility === "hidden" ? (
              <ActionButton
                text="Show"
                type="primary"
                onPress={onShow}
                testID={testID ? `${testID}-show-btn` : undefined}
              />
            ) : null}
            {review.visibility !== "removed" ? (
              <ActionButton
                text="Remove"
                type="danger"
                onPress={onRemove}
                testID={testID ? `${testID}-remove-btn` : undefined}
              />
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
};

export default ReviewListItem;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  nameText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
  },
  badge: {
    backgroundColor: colors.primary_light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.primary_shadow,
    fontWeight: "700",
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 8,
  },
  commentText: {
    color: colors.dark,
    marginTop: 8,
    lineHeight: 20,
  },
  metaText: {
    color: colors.muted,
    marginTop: 6,
    fontSize: 12,
  },
  adminMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  visibilityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.light,
  },
  visibilityChipText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButton_primary: {
    backgroundColor: colors.primary,
  },
  actionButton_muted: {
    backgroundColor: colors.muted,
  },
  actionButton_danger: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
});
