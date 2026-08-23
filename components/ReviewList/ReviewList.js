import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, RATING_SCALE } from "../../constants";

const dateFormat = (value) => {
  if (!value) return "";
  const t = new Date(value);
  const date = ("0" + t.getDate()).slice(-2);
  const month = ("0" + (t.getMonth() + 1)).slice(-2);
  const year = t.getFullYear();
  return `${date}-${month}-${year}`;
};

const Stars = ({ rating }) => (
  <View style={styles.starsRow}>
    {RATING_SCALE.map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={14}
        color={colors.warning}
      />
    ))}
  </View>
);

// Render a list of reviews. When `admin`, each row shows hide/show + remove
// actions and hidden rows are dimmed with a Hidden tag.
const ReviewList = ({
  reviews = [],
  admin = false,
  onToggleVisibility,
  onRemove,
  testID,
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {reviews.map((review, index) => {
        const rowTestID = testID ? `${testID}-item-${index}` : undefined;
        const hidden = review.status === "hidden";
        return (
          <View
            style={[styles.reviewCard, hidden && styles.reviewCardHidden]}
            key={review._id || index}
            testID={rowTestID}
          >
            <View style={styles.topRow}>
              <Stars rating={review.rating} />
              {review.verifiedPurchase && (
                <View
                  style={styles.verifiedPill}
                  testID={rowTestID ? `${rowTestID}-verified` : undefined}
                >
                  <Ionicons name="checkmark-circle" size={12} color={colors.white} />
                  <Text style={styles.verifiedText}>Verified Purchase</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <Text
                style={styles.reviewerName}
                testID={rowTestID ? `${rowTestID}-name` : undefined}
              >
                {review.user?.name}
              </Text>
              <Text style={styles.reviewDate}>{dateFormat(review.createdAt)}</Text>
            </View>
            {review.comment ? (
              <Text
                style={styles.comment}
                testID={rowTestID ? `${rowTestID}-comment` : undefined}
              >
                {review.comment}
              </Text>
            ) : null}
            {admin && (
              <View style={styles.adminActions}>
                {hidden && (
                  <View style={styles.hiddenTag}>
                    <Text style={styles.hiddenTagText}>Hidden</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onToggleVisibility && onToggleVisibility(review)}
                  testID={rowTestID ? `${rowTestID}-toggle-btn` : undefined}
                >
                  <Ionicons
                    name={hidden ? "eye" : "eye-off"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onRemove && onRemove(review)}
                  testID={rowTestID ? `${rowTestID}-remove-btn` : undefined}
                >
                  <Ionicons name="trash" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  emptyContainer: {
    width: "100%",
    padding: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
  reviewCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  reviewCardHidden: {
    opacity: 0.5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "bold",
    marginLeft: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.muted,
  },
  comment: {
    fontSize: 13,
    color: colors.dark,
    marginTop: 6,
  },
  adminActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  hiddenTag: {
    backgroundColor: colors.muted,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: "auto",
  },
  hiddenTagText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "bold",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
    marginLeft: 8,
  },
});
