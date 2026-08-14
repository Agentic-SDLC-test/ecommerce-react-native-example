import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const STAR_ROWS = [5, 4, 3, 2, 1];

const RatingSummary = ({
  averageRating = 0,
  totalVisibleReviews = 0,
  ratingDistribution = {},
  testID,
}) => {
  const totalReviews = totalVisibleReviews || 0;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headingRow}>
        <View style={styles.averageContainer}>
          <Text
            style={styles.averageText}
            testID={testID ? `${testID}-average` : undefined}
          >
            {Number(averageRating || 0).toFixed(1)}
          </Text>
          <View style={styles.starRow}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text
              style={styles.countText}
              testID={testID ? `${testID}-count` : undefined}
            >
              {totalReviews} review{totalReviews === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
        {totalReviews === 0 && (
          <Text
            style={styles.emptyText}
            testID={testID ? `${testID}-empty` : undefined}
          >
            No verified reviews yet.
          </Text>
        )}
      </View>

      <View style={styles.distributionContainer}>
        {STAR_ROWS.map((stars) => {
          const count = ratingDistribution?.[stars] || 0;
          const widthPercent =
            totalReviews === 0 ? "0%" : `${(count / totalReviews) * 100}%`;

          return (
            <View key={stars} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{stars} star</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: widthPercent }]} />
              </View>
              <Text
                style={styles.distributionCount}
                testID={testID ? `${testID}-distribution-${stars}` : undefined}
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
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    marginTop: 10,
  },
  headingRow: {
    marginBottom: 10,
  },
  averageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  averageText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.dark,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: {
    color: colors.muted,
    fontWeight: "600",
  },
  emptyText: {
    color: colors.muted,
    marginTop: 8,
  },
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distributionLabel: {
    width: 52,
    color: colors.muted,
    fontSize: 12,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  fill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  distributionCount: {
    width: 20,
    textAlign: "right",
    color: colors.muted,
    fontSize: 12,
  },
});
