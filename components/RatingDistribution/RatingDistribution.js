import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { colors } from "../../constants";
import { buildDistributionRows } from "../../utils/reviewHelper";

const RatingDistribution = ({ distribution, totalCount, testID }) => {
  if (!distribution) return null;

  const rows = buildDistributionRows(distribution, totalCount);

  return (
    <View style={styles.container} testID={testID}>
      {rows.map(({ stars, count, percent }) => (
        <View
          key={stars}
          style={styles.row}
          testID={`${testID}-row-${stars}`}
          accessible
          accessibilityLabel={`${stars} stars: ${count} reviews`}
        >
          <Text style={styles.label}>{stars} ★</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.count} testID={`${testID}-count-${stars}`}>
            {count}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default RatingDistribution;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    width: 36,
    fontSize: 12,
    color: colors.muted,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffc107",
  },
  count: {
    width: 24,
    textAlign: "right",
    fontSize: 12,
    color: colors.muted,
  },
});
