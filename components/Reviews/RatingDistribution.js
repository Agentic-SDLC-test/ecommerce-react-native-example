import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";

const RatingDistribution = ({ distribution, totalCount, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution?.[star] || 0;
        const widthPercent = totalCount > 0 ? (count / totalCount) * 100 : 0;

        return (
          <View
            key={star}
            style={styles.row}
            testID={testID ? `${testID}-row-${star}` : undefined}
          >
            <Text style={styles.starLabel}>{star} ★</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
            </View>
            <Text style={styles.countLabel}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default RatingDistribution;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starLabel: {
    width: 36,
    fontSize: 12,
    color: colors.muted,
    fontWeight: "bold",
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
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  countLabel: {
    width: 24,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
