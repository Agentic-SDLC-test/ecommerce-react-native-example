import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import ReviewStars from "../ReviewStars/ReviewStars";

const ReviewSummary = ({ summary, testID }) => {
  const {
    averageRating = 0,
    totalReviews = 0,
    distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  } = summary || {};

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {averageRating.toFixed(1)}
        </Text>
        <View>
          <ReviewStars rating={Math.round(averageRating)} readonly size={16} testID={testID ? `${testID}-stars` : undefined} />
          <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </Text>
        </View>
      </View>
      {[5, 4, 3, 2, 1].map((star) => (
        <View key={star} style={styles.distributionRow} testID={testID ? `${testID}-row-${star}` : undefined}>
          <Text style={styles.starLabel}>{star}</Text>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                { width: `${((distribution[star] || 0) / maxCount) * 100}%` },
              ]}
              testID={testID ? `${testID}-bar-${star}` : undefined}
            />
          </View>
          <Text style={styles.starCount}>{distribution[star] || 0}</Text>
        </View>
      ))}
    </View>
  );
};

export default ReviewSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  averageText: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 12,
    color: colors.dark,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starLabel: {
    width: 16,
    fontSize: 12,
    color: colors.muted,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  starCount: {
    width: 20,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
