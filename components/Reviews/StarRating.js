import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const StarRating = ({
  rating,
  onPress,
  size = 20,
  interactive = false,
  testID,
}) => {
  return (
    <View style={{ flexDirection: "row" }} testID={testID}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;
        const icon = (
          <Ionicons
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? colors.primary : colors.muted}
            testID={testID ? `${testID}-star-${value}` : undefined}
          />
        );
        if (interactive && onPress) {
          return (
            <TouchableOpacity
              key={value}
              onPress={() => onPress(value)}
              testID={testID ? `${testID}-btn-${value}` : undefined}
            >
              {icon}
            </TouchableOpacity>
          );
        }
        return <View key={value}>{icon}</View>;
      })}
    </View>
  );
};

export default StarRating;
