import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, RATING_SCALE } from "../../constants";

// Render average (filled stars), total count, and a 5-row distribution bar.
// Renders an empty state when there are no reviews yet.
const RatingSummary = ({ summary, testID }) => {
  const average = summary?.average ?? 0;
  const total = summary?.total ?? 0;
  const distribution = summary?.distribution || {};

  if (total === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {average.toFixed(1)}
        </Text>
        <View style={styles.starsRow} testID={testID ? `${testID}-stars` : undefined}>
          {RATING_SCALE.map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(average) ? "star" : "star-outline"}
              size={18}
              color={colors.warning}
            />
          ))}
        </View>
        <Text style={styles.totalText} testID={testID ? `${testID}-total` : undefined}>
          {total} {total === 1 ? "review" : "reviews"}
        </Text>
      </View>
      <View style={styles.distributionContainer}>
        {[...RATING_SCALE].reverse().map((star) => {
          const count = distribution[star] || 0;
          const pct = total === 0 ? 0 : (count / total) * 100;
          return (
            <View
              style={styles.distributionRow}
              key={star}
              testID={testID ? `${testID}-distribution-${star}` : undefined}
            >
              <Text style={styles.distributionLabel}>{star}</Text>
              <Ionicons name="star" size={12} color={colors.warning} />
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text
                style={styles.distributionCount}
                testID={testID ? `${testID}-distribution-${star}-count` : undefined}
              >
                {count}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default RatingSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  averageText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
    marginRight: 10,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  totalText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: "bold",
  },
  distributionContainer: {
    marginTop: 10,
    width: "100%",
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distributionLabel: {
    fontSize: 12,
    color: colors.muted,
    width: 12,
    textAlign: "center",
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: colors.muted,
    width: 24,
    textAlign: "right",
  },
});
