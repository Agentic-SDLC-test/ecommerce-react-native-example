import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const STAR_VALUES = [1, 2, 3, 4, 5];

const StarRatingInput = ({ value = 0, onChange, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {STAR_VALUES.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          testID={testID ? `${testID}-star-${star}` : undefined}
        >
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={32}
            color={colors.primary}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default StarRatingInput;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  star: {
    marginHorizontal: 4,
  },
});
