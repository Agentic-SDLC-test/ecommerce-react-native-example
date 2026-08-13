import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const ReviewStars = ({
  rating = 0,
  onChange,
  size = 18,
  readonly = false,
  testID,
}) => {
  return (
    <View style={{ flexDirection: "row" }} testID={testID}>
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
            onPress={() => onChange && onChange(star)}
            testID={testID ? `${testID}-star-${star}` : undefined}
          >
            <Ionicons name={iconName} size={size} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ReviewStars;
