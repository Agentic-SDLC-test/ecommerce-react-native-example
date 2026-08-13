import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const StarRatingDisplay = ({ rating, size = 16, testID }) => {
  const rounded = Math.round(rating);

  return (
    <View style={styles.container} testID={testID}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rounded ? "star" : "star-outline"}
          size={size}
          color={star <= rounded ? colors.warning : colors.muted}
          testID={testID ? `${testID}-star-${star}` : undefined}
        />
      ))}
    </View>
  );
};

export default StarRatingDisplay;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
