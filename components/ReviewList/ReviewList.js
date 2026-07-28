import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const STAR_VALUES = [1, 2, 3, 4, 5];

export const formatRelativeDate = (isoDate) => {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

const ReviewList = ({ item, isOwner, onPressEdit, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.reviewerRow}>
          <Text style={styles.reviewerName} testID={testID ? `${testID}-name` : undefined}>
            {item?.userName}
          </Text>
          {item?.verifiedPurchase && (
            <View style={styles.badge} testID={testID ? `${testID}-verified-badge` : undefined}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>Verified Purchase</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText} testID={testID ? `${testID}-date` : undefined}>
          {formatRelativeDate(item?.createdAt)}
        </Text>
      </View>
      <View style={styles.starsRow} testID={testID ? `${testID}-stars` : undefined}>
        {STAR_VALUES.map((star) => (
          <Ionicons
            key={star}
            name={star <= (item?.rating || 0) ? "star" : "star-outline"}
            size={16}
            color={colors.primary}
            style={styles.star}
          />
        ))}
      </View>
      {item?.text ? (
        <Text style={styles.reviewText} testID={testID ? `${testID}-text` : undefined}>
          {item.text}
        </Text>
      ) : null}
      {isOwner && (
        <TouchableOpacity onPress={onPressEdit} testID={testID ? `${testID}-edit-btn` : undefined}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  badge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.muted,
  },
  starsRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: 4,
  },
  star: {
    marginRight: 2,
  },
  reviewText: {
    fontSize: 13,
    color: colors.dark,
    marginTop: 6,
  },
  editText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    marginTop: 8,
  },
});
