import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import StarRating from "../StarRating";
import { formatAverage, reviewCountLabel } from "../../utils/reviews";

const ReviewSummary = ({ average, count, testID }) => {
  //an unreviewed product must never look like a badly-rated one, so show an
  //invitation instead of a score
  if (!count || average === null || average === undefined) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.emptyTitle} testID={testID ? `${testID}-empty-title` : undefined}>
          No reviews yet
        </Text>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty-text` : undefined}>
          Be the first to review this product.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.averageRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {formatAverage(average)}
        </Text>
        <StarRating value={average} size={18} testID={testID ? `${testID}-stars` : undefined} />
      </View>
      <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
        {reviewCountLabel(count)}
      </Text>
    </View>
  );
};

export default ReviewSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 10,
  },
  averageRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  averageText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
    marginRight: 10,
  },
  countText: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
    fontWeight: "bold",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
  },
  emptyText: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
});
