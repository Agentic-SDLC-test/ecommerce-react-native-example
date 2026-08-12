import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import RatingStars from "../RatingStars";
import {
  formatAverage,
  ratingSummaryAccessibilityLabel,
  distributionRows,
} from "../../utils/reviews";
import { REVIEWS_EMPTY_STATE_TEXT } from "../../constants/Reviews";

// The aggregate block. A product with no visible reviews renders one neutral
// line — no stars, no numeral — because on day one that is every product.
const RatingSummary = ({ summary, testID }) => {
  if (!summary || summary.count === 0) {
    return (
      <View
        style={styles.container}
        accessibilityLabel={ratingSummaryAccessibilityLabel(summary)}
        testID={testID}
      >
        <Text
          style={styles.emptyText}
          testID={testID ? `${testID}-empty` : undefined}
        >
          {REVIEWS_EMPTY_STATE_TEXT}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityLabel={ratingSummaryAccessibilityLabel(summary)}
      testID={testID}
    >
      <View style={styles.averageContainer}>
        <Text
          style={styles.averageText}
          testID={testID ? `${testID}-average` : undefined}
        >
          {formatAverage(summary.average)}
        </Text>
        <RatingStars
          rating={Math.round(summary.average)}
          size={14}
          testID={testID ? `${testID}-stars` : undefined}
        />
        <Text
          style={styles.countText}
          testID={testID ? `${testID}-count` : undefined}
        >
          {summary.count === 1 ? "1 review" : `${summary.count} reviews`}
        </Text>
      </View>
      <View style={styles.distributionContainer}>
        {distributionRows(summary).map((row) => (
          <View
            key={row.rating}
            style={styles.distributionRow}
            accessibilityLabel={`${row.rating} star, ${row.count}`}
            testID={testID ? `${testID}-bar-${row.rating}` : undefined}
          >
            <Text style={styles.distributionLabel}>{row.rating}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${row.percent}%` }]} />
            </View>
            <Text style={styles.distributionLabel}>{row.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RatingSummary;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  averageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginRight: 15,
  },
  averageText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
  },
  countText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "bold",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
  },
  distributionContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  distributionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  distributionLabel: {
    fontSize: 11,
    color: colors.muted,
    width: 18,
    textAlign: "center",
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.shadow,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
});
