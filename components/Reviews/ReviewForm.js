import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";
import StarRating from "./StarRating";

const ReviewForm = ({
  canReview,
  initialReview,
  onSubmit,
  submitting = false,
  testID,
}) => {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating || 0);
      setBody(initialReview.body || "");
    } else {
      setRating(0);
      setBody("");
    }
    setLocalError("");
  }, [initialReview]);

  const handleSubmit = () => {
    const trimmedBody = body.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setLocalError("Please select a rating between 1 and 5 stars");
      return;
    }
    if (trimmedBody.length < 3 || trimmedBody.length > 500) {
      setLocalError("Review text must be between 3 and 500 characters");
      return;
    }
    setLocalError("");
    onSubmit(rating, trimmedBody);
  };

  const isEdit = !!initialReview;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title} testID={testID ? `${testID}-title` : undefined}>
        {isEdit ? "Edit your review" : "Write your review"}
      </Text>
      {!canReview ? (
        <Text style={styles.disabledMessage} testID={testID ? `${testID}-disabled` : undefined}>
          Purchase this product to leave a review
        </Text>
      ) : (
        <>
          <Text style={styles.label}>Your rating</Text>
          <StarRating
            rating={rating}
            onPress={setRating}
            interactive
            size={28}
            testID={testID ? `${testID}-rating` : undefined}
          />
          <Text style={styles.label}>Your review</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={body}
            onChangeText={setBody}
            placeholder="Share your experience with this product..."
            maxLength={500}
            testID={testID ? `${testID}-body-input` : undefined}
          />
          <Text style={styles.charCount}>{body.trim().length}/500</Text>
          {localError ? (
            <Text style={styles.errorText} testID={testID ? `${testID}-error` : undefined}>
              {localError}
            </Text>
          ) : null}
          <CustomButton
            text={isEdit ? "Update Review" : "Submit Review"}
            onPress={handleSubmit}
            disabled={submitting}
            testID={testID ? `${testID}-submit` : undefined}
          />
        </>
      )}
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.light,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.dark,
  },
  disabledMessage: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
    color: colors.dark,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 14,
    elevation: 2,
  },
  charCount: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: 8,
  },
});
