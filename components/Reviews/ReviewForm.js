import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";
import RatingStars from "./RatingStars";

const ReviewForm = ({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSubmit,
  loading,
  isEdit,
  error,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.headingText}>
        {isEdit ? "Edit your review" : "Write a review"}
      </Text>
      <RatingStars
        rating={rating}
        onChange={onRatingChange}
        size={28}
        testID={testID ? `${testID}-rating` : undefined}
      />
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        placeholder="Share your experience (10-500 characters)"
        value={comment}
        onChangeText={onCommentChange}
        maxLength={500}
        testID={testID ? `${testID}-comment-input` : undefined}
      />
      {error ? (
        <Text style={styles.errorText} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : null}
      <CustomButton
        text={isEdit ? "Update Review" : "Submit Review"}
        onPress={onSubmit}
        disabled={loading}
        testID={testID ? `${testID}-submit-btn` : "product-detail-review-submit-btn"}
      />
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 8,
  },
});
