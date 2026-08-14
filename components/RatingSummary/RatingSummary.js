import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

// Presentational summary of a product's aggregate rating: average score,
// total review count, and a 5-row distribution of how many reviews fall
// into each star level.
const RatingSummary = ({ summary, testID }) => {
  const average = summary?.average || 0;
  const count = summary?.count || 0;
  const distribution = summary?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {average.toFixed(1)}
        </Text>
        <Ionicons name="star" size={20} color={colors.warning} />
        <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
          {`(${count} review${count === 1 ? "" : "s"})`}
        </Text>
      </View>
      {[5, 4, 3, 2, 1].map((star) => {
        const starCount = distribution[star] || 0;
        const barWidth = count > 0 ? `${(starCount / count) * 100}%` : "0%";
        return (
          <View style={styles.distributionRow} key={star} testID={testID ? `${testID}-row-${star}` : undefined}>
            <Text style={styles.distributionLabel}>{`${star}★`}</Text>
            <View style={styles.distributionBarTrack}>
              <View style={[styles.distributionBarFill, { width: barWidth }]} />
            </View>
            <Text style={styles.distributionCount} testID={testID ? `${testID}-row-${star}-count` : undefined}>
              {starCount}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default RatingSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 10,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  averageText: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 5,
  },
  countText: {
    marginLeft: 5,
    color: colors.muted,
  },
  distributionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distributionLabel: {
    width: 30,
    fontSize: 12,
    color: colors.muted,
  },
  distributionBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.light,
    borderRadius: 3,
    marginHorizontal: 8,
  },
  distributionBarFill: {
    height: 6,
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  distributionCount: {
    width: 20,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
