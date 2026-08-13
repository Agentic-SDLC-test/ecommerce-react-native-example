import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const RatingStars = ({ rating, onChange, size = 24, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!onChange}
          onPress={() => onChange && onChange(star)}
          testID={testID ? `${testID}-star-${star}` : undefined}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? colors.warning : colors.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RatingStars;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
