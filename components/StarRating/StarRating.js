import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const STAR_VALUES = [1, 2, 3, 4, 5];

const StarRating = ({ rating = 0, size = 16, onChange, testID }) => {
  const interactive = typeof onChange === "function";

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityLabel={interactive ? undefined : `Rated ${rating} out of 5`}
    >
      {STAR_VALUES.map((value) => {
        const filled = rating - value >= 0;
        const half = !filled && rating - (value - 1) >= 0.5;
        const iconName = filled ? "star" : half ? "star-half" : "star-outline";

        if (!interactive) {
          return (
            <Ionicons
              key={value}
              name={iconName}
              size={size}
              color={colors.primary}
              testID={testID ? `${testID}-star-${value}` : undefined}
            />
          );
        }

        return (
          <TouchableOpacity
            key={value}
            onPress={() => onChange(value)}
            accessibilityRole="button"
            accessibilityLabel={`${value} star${value > 1 ? "s" : ""}`}
            testID={testID ? `${testID}-star-${value}` : undefined}
          >
            <Ionicons name={iconName} size={size} color={colors.primary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StarRating;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
