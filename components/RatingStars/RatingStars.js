import { View, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { formatStarsLabel } from "../../utils/reviewHelper";

const RatingStars = ({ rating, size = 14, testID }) => {
  const rounded = Math.round(rating);
  return (
    <View
      style={styles.row}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={formatStarsLabel(rating)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rounded ? "star" : "star-outline"}
          size={size}
          color={star <= rounded ? "#ffc107" : colors.muted}
          style={styles.star}
        />
      ))}
    </View>
  );
};

export default RatingStars;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  star: {
    marginRight: 2,
  },
});
