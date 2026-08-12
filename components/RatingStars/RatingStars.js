import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { RATING_MAX, RATING_LABELS } from "../../constants/Reviews";

// Read-only for display, tappable for input. Filled and empty stars differ in
// glyph as well as colour, so a rating is never encoded by colour alone.
const RatingStars = ({ rating, onRate, size = 16, testID }) => {
  const stars = [];
  for (let value = 1; value <= RATING_MAX; value += 1) {
    stars.push(value);
  }

  const glyph = (value) => (
    <Ionicons
      name={value <= rating ? "star" : "star-outline"}
      size={size}
      color={value <= rating ? colors.warning : colors.muted}
    />
  );

  if (!onRate) {
    return (
      <View
        style={styles.row}
        accessibilityLabel={`${rating} out of 5`}
        testID={testID}
      >
        {stars.map((value) => (
          <View key={value} testID={testID ? `${testID}-star-${value}` : undefined}>
            {glyph(value)}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row} testID={testID}>
      {stars.map((value) => (
        <TouchableOpacity
          key={value}
          style={styles.touchable}
          onPress={() => onRate(value)}
          accessibilityRole="button"
          accessibilityLabel={`${value} stars — ${RATING_LABELS[value]}`}
          testID={testID ? `${testID}-star-${value}` : undefined}
        >
          {glyph(value)}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RatingStars;

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  touchable: {
    padding: 4,
  },
});
