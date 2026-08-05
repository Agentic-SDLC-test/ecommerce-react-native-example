import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const formatReviewDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-CA");
};

export const renderStars = (rating, testID) => {
  return Array.from({ length: 5 }).map((_, index) => {
    const iconName = index < rating ? "star" : "star-outline";

    return (
      <Ionicons
        key={`${testID || "review"}-star-${index}`}
        name={iconName}
        size={16}
        color={colors.warning}
        testID={testID ? `${testID}-star-${index}` : undefined}
      />
    );
  });
};

const ReviewList = ({ review, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.starsRow}>{renderStars(review?.rating || 0, testID)}</View>
        <View style={styles.badge}>
          <Text
            style={styles.badgeText}
            testID={testID ? `${testID}-verified-badge` : undefined}
          >
            Verified Purchase
          </Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text
          style={styles.userName}
          testID={testID ? `${testID}-user-name` : undefined}
        >
          {review?.user?.name}
        </Text>
        <Text
          style={styles.dateText}
          testID={testID ? `${testID}-updated-at` : undefined}
        >
          {formatReviewDate(review?.updatedAt)}
        </Text>
      </View>
      <Text style={styles.comment} testID={testID ? `${testID}-comment` : undefined}>
        {review?.comment}
      </Text>
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
    marginTop: 10,
    elevation: 2,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  badge: {
    backgroundColor: colors.primary_light,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.primary_shadow,
    fontSize: 11,
    fontWeight: "bold",
  },
  metaRow: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  userName: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  dateText: {
    color: colors.muted,
    fontSize: 12,
  },
  comment: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
