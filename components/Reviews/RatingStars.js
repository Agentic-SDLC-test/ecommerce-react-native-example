import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const RatingStars = ({
  rating,
  onChange,
  readonly = false,
  size = 20,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const iconName = filled ? "star" : "star-outline";
        const color = filled ? colors.primary : colors.muted;

        if (readonly) {
          return (
            <Ionicons
              key={star}
              name={iconName}
              size={size}
              color={color}
              testID={testID ? `${testID}-star-${star}` : undefined}
            />
          );
        }

        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            testID={testID ? `${testID}-star-${star}` : undefined}
          >
            <Ionicons name={iconName} size={size} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RatingStars;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
