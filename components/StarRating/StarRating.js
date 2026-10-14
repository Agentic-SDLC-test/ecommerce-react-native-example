import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const STARS = [1, 2, 3, 4, 5];

const StarRating = ({ rating = 0, size = 16, onChange, testID }) => {
  if (!onChange) {
    return (
      <View
        style={styles.row}
        testID={testID}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Rated ${rating} out of 5`}
      >
        {STARS.map((i) => {
          let name = "star-outline";
          if (rating >= i) {
            name = "star";
          } else if (rating >= i - 0.5) {
            name = "star-half";
          }
          return (
            <Ionicons key={i} name={name} size={size} color={colors.warning} />
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.row} testID={testID}>
      {STARS.map((i) => (
        <TouchableOpacity
          key={i}
          testID={testID ? `${testID}-${i}` : undefined}
          accessibilityRole="button"
          accessibilityLabel={`${i}${i === 1 ? " star" : " stars"}`}
          accessibilityState={{ selected: rating === i }}
          hitSlop={6}
          onPress={() => onChange(i)}
        >
          <Ionicons
            name={rating >= i ? "star" : "star-outline"}
            size={size}
            color={colors.warning}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default StarRating;

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
});
