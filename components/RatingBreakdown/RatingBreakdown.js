import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants";

export const getBarWidth = (count, total) => {
  if (!total) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
};

const RatingBreakdown = ({ ratingDistribution, totalReviewCount, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = ratingDistribution?.[rating] || 0;

        return (
          <View
            key={`rating-breakdown-${rating}`}
            style={styles.row}
            testID={testID ? `${testID}-row-${rating}` : undefined}
          >
            <Text style={styles.label}>{rating} star</Text>
            <View style={styles.track}>
              <View
                style={[styles.fill, { width: getBarWidth(count, totalReviewCount) }]}
                testID={testID ? `${testID}-bar-${rating}` : undefined}
              />
            </View>
            <Text style={styles.count}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default RatingBreakdown;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 10,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  label: {
    width: 48,
    fontSize: 12,
    color: colors.muted,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 8,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  count: {
    width: 22,
    textAlign: "right",
    fontSize: 12,
    color: colors.dark,
    fontWeight: "bold",
  },
});
