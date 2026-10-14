import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import StarRating from "../StarRating";
import { distributionRows, formatAverage, reviewCountLabel } from "../../utils/reviews";

const ReviewSummary = ({ summary, testID }) => {
  if (!summary || summary.count === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews yet
        </Text>
      </View>
    );
  }

  const rows = distributionRows(summary);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.left}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {formatAverage(summary.average)}
        </Text>
        <StarRating rating={summary.average || 0} size={16} />
        <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
          {reviewCountLabel(summary.count)}
        </Text>
      </View>
      <View style={styles.right}>
        {rows.map((row) => (
          <View
            key={row.stars}
            style={styles.distributionRow}
            testID={testID ? `${testID}-row-${row.stars}` : undefined}
          >
            <Text style={styles.distributionLabel}>{row.stars}★</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${row.percent}%` }]} />
            </View>
            <Text style={styles.distributionCount}>{row.count}</Text>
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
    display: "flex",
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  emptyContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
  },
  left: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingRight: 10,
  },
  averageText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.dark,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 5,
  },
  right: {
    flex: 2,
    justifyContent: "center",
  },
  distributionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  distributionLabel: {
    width: 25,
    fontSize: 12,
    color: colors.muted,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: colors.light,
    borderRadius: 3,
    marginHorizontal: 6,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  distributionCount: {
    width: 25,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
