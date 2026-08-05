import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";
import RatingStars from "./RatingStars";

const ReviewForm = ({
  rating,
  reviewText,
  onRatingChange,
  onTextChange,
  onSubmit,
  disabled,
  submitLabel,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>Your rating</Text>
      <RatingStars
        rating={rating}
        onChange={onRatingChange}
        size={28}
        testID={testID ? `${testID}-stars` : undefined}
      />
      <Text style={styles.label}>Your review</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        placeholder="Share your experience..."
        value={reviewText}
        onChangeText={onTextChange}
        maxLength={500}
        editable={!disabled}
        testID={testID ? `${testID}-input` : undefined}
      />
      <CustomButton
        text={submitLabel}
        onPress={onSubmit}
        disabled={disabled}
        testID={testID ? `${testID}-submit` : undefined}
      />
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    minHeight: 80,
    marginBottom: 10,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 2,
    textAlignVertical: "top",
  },
});
