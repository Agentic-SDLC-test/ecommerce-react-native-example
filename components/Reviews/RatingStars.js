import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const RatingStars = ({
  value = 0,
  onChange,
  readonly = false,
  size = 20,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {[1, 2, 3, 4, 5].map((ratingValue) => {
        const filled = ratingValue <= value;
        const icon = (
          <Ionicons
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? colors.warning : colors.muted}
          />
        );

        if (readonly) {
          return (
            <View key={ratingValue} testID={testID ? `${testID}-star-${ratingValue}` : undefined}>
              {icon}
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={ratingValue}
            onPress={() => onChange?.(ratingValue)}
            testID={testID ? `${testID}-star-${ratingValue}` : undefined}
          >
            {icon}
          </TouchableOpacity>
        );
      })}
      <Text style={styles.valueText} testID={testID ? `${testID}-value` : undefined}>
        {value}/5
      </Text>
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
  valueText: {
    marginLeft: 6,
    color: colors.muted,
    fontWeight: "600",
  },
});
