import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import StarRating from "./StarRating";
import ReviewList from "./ReviewList";

const ReviewSummary = ({ summary, testID }) => {
  const {
    averageRating = 0,
    totalReviews = 0,
    distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentReviews = [],
  } = summary || {};

  if (totalReviews === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle} testID={testID ? `${testID}-title` : undefined}>
          Customer Reviews
        </Text>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews yet
        </Text>
        <Text style={styles.emptySubtext} testID={testID ? `${testID}-empty-sub` : undefined}>
          Be the first verified purchaser to review this product
        </Text>
      </View>
    );
  }

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle} testID={testID ? `${testID}-title` : undefined}>
        Customer Reviews
      </Text>
      <View style={styles.aggregateRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {averageRating.toFixed(1)}
        </Text>
        <View>
          <StarRating rating={Math.round(averageRating)} testID={testID ? `${testID}-stars` : undefined} />
          <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </Text>
        </View>
      </View>
      <View style={styles.distributionContainer} testID={testID ? `${testID}-distribution` : undefined}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const widthPercent = (count / maxCount) * 100;
          return (
            <View key={star} style={styles.distributionRow} testID={testID ? `${testID}-dist-${star}` : undefined}>
              <Text style={styles.distributionLabel}>{star}</Text>
              <IoniconsStar />
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.recentTitle} testID={testID ? `${testID}-recent-title` : undefined}>
        Recent Reviews
      </Text>
      <ReviewList reviews={recentReviews} testID={testID ? `${testID}-list` : undefined} />
    </View>
  );
};

const IoniconsStar = () => (
  <Text style={styles.starIcon}>★</Text>
);

export default ReviewSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.dark,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
  },
  aggregateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  averageText: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.dark,
    marginRight: 15,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  distributionContainer: {
    marginBottom: 15,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distributionLabel: {
    width: 12,
    fontSize: 12,
    color: colors.muted,
  },
  starIcon: {
    fontSize: 10,
    color: colors.primary,
    marginRight: 6,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    marginRight: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  distributionCount: {
    width: 24,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.dark,
  },
});
