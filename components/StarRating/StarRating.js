import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { starStates, starIconName, MAX_RATING } from "../../utils/reviews";

const StarRating = ({ value = 0, size = 16, editable = false, onChange, testID }) => {
  //editable mode takes whole stars only — no half-star input
  if (editable) {
    return (
      <View style={styles.container} testID={testID}>
        {Array.from({ length: MAX_RATING }, (_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.starButton}
            onPress={() => onChange && onChange(index + 1)}
            testID={testID ? `${testID}-star-${index + 1}` : undefined}
          >
            <Ionicons
              name={index < value ? "star" : "star-outline"}
              size={size}
              color={index < value ? colors.warning : colors.muted}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  //read-only mode renders a fractional average as a half star
  return (
    <View style={styles.container} testID={testID}>
      {starStates(value).map((state, index) => (
        <Ionicons
          key={index}
          name={starIconName(state)}
          size={size}
          color={state === "empty" ? colors.muted : colors.warning}
        />
      ))}
    </View>
  );
};

export default StarRating;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    padding: 2,
  },
});
