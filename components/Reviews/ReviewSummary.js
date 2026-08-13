import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import RatingStars from "./RatingStars";

const ReviewSummary = ({ summary, testID }) => {
  const { averageRating, totalReviews, distribution } = summary || {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.averageRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : "product-detail-review-average"}>
          {averageRating.toFixed(1)}
        </Text>
        <RatingStars rating={Math.round(averageRating)} size={18} testID={testID ? `${testID}-stars` : undefined} />
      </View>
      <Text style={styles.countText} testID={testID ? `${testID}-count` : "product-detail-review-count"}>
        {totalReviews === 0 ? "No reviews yet" : `${totalReviews} review${totalReviews !== 1 ? "s" : ""}`}
      </Text>
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.distributionRow} testID={testID ? `${testID}-dist-${star}` : undefined}>
            <Text style={styles.starLabel}>{star}</Text>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width:
                      totalReviews > 0
                        ? `${((distribution[star] || 0) / totalReviews) * 100}%`
                        : "0%",
                  },
                ]}
              />
            </View>
            <Text style={styles.countLabel}>{distribution[star] || 0}</Text>
          </View>
        ))}
      </View>
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
  averageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  averageText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
  },
  countText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 8,
  },
  distributionContainer: {
    width: "100%",
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
    fontWeight: "bold",
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
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  countLabel: {
    width: 20,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
