import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants";
import RatingStars from "./RatingStars";

const DEFAULT_DISTRIBUTION = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const ReviewSummaryCard = ({ summary, testID }) => {
  const safeSummary = summary || {
    averageRating: 0,
    totalReviewCount: 0,
    ratingDistribution: DEFAULT_DISTRIBUTION,
  };
  const distribution = safeSummary.ratingDistribution || DEFAULT_DISTRIBUTION;
  const total = safeSummary.totalReviewCount || 0;

  return (
    <View style={styles.card} testID={testID}>
      <Text style={styles.title} testID={testID ? `${testID}-title` : undefined}>
        Ratings & Reviews
      </Text>
      <View style={styles.header}>
        <Text style={styles.average} testID={testID ? `${testID}-average` : undefined}>
          {Number(safeSummary.averageRating || 0).toFixed(1)}
        </Text>
        <View>
          <RatingStars
            readonly
            value={Math.round(Number(safeSummary.averageRating || 0))}
            size={18}
            testID={testID ? `${testID}-stars` : undefined}
          />
          <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
            {total} review{total === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const width = total ? `${Math.max((count / total) * 100, count ? 10 : 0)}%` : "0%";

        return (
          <View
            style={styles.distributionRow}
            key={rating}
            testID={testID ? `${testID}-distribution-${rating}` : undefined}
          >
            <Text style={styles.rowLabel}>{rating}★</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width }]} />
            </View>
            <Text style={styles.rowCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default ReviewSummaryCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  average: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.dark,
    marginRight: 12,
  },
  countText: {
    color: colors.muted,
    marginTop: 4,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  rowLabel: {
    width: 28,
    color: colors.muted,
    fontWeight: "600",
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 999,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  rowCount: {
    width: 18,
    textAlign: "right",
    color: colors.muted,
  },
});
