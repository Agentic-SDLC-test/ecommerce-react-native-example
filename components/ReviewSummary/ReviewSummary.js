import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const RATING_LEVELS = [5, 4, 3, 2, 1];

const ReviewSummary = ({ summary, testID }) => {
  const average = summary?.average || 0;
  const count = summary?.count || 0;
  const distribution = summary?.distribution || {};

  if (count === 0) {
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
        <Ionicons name="star" size={20} color={colors.primary} style={styles.headerStar} />
        <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
          ({count} review{count === 1 ? "" : "s"})
        </Text>
      </View>
      {RATING_LEVELS.map((level) => {
        const levelCount = distribution[String(level)] || 0;
        const width = count > 0 ? `${(levelCount / count) * 100}%` : "0%";
        return (
          <View
            style={styles.distributionRow}
            key={level}
            testID={testID ? `${testID}-row-${level}` : undefined}
          >
            <Text style={styles.distributionLabel}>{level}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width }]} />
            </View>
            <Text
              style={styles.distributionCount}
              testID={testID ? `${testID}-row-${level}-count` : undefined}
            >
              {levelCount}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default ReviewSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  averageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
  },
  headerStar: {
    marginLeft: 6,
    marginRight: 6,
  },
  countText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
  },
  distributionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distributionLabel: {
    width: 16,
    fontSize: 12,
    color: colors.muted,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  distributionCount: {
    width: 24,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
