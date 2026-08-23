import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../CustomButton";
import { colors, RATING_SCALE, MAX_REVIEW_LENGTH, isValidRating } from "../../constants";

// Star picker (1-5, required) + optional comment + submit. Prefilled when
// editing. Client-guards rating before calling onSubmit; the server is the
// authority for eligibility and validation.
const ReviewForm = ({ initial = null, onSubmit, submitting = false, testID }) => {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [comment, setComment] = useState(initial?.comment || "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!isValidRating(rating)) {
      setError("Please select a rating from 1 to 5 stars");
      return;
    }
    if (comment.length > MAX_REVIEW_LENGTH) {
      setError(`Review must be ${MAX_REVIEW_LENGTH} characters or fewer`);
      return;
    }
    setError("");
    onSubmit(rating, comment);
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.heading} testID={testID ? `${testID}-heading` : undefined}>
        {initial ? "Edit your review" : "Write a review"}
      </Text>
      <View style={styles.starsRow} testID={testID ? `${testID}-stars` : undefined}>
        {RATING_SCALE.map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            testID={testID ? `${testID}-star-${star}` : undefined}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={30}
              color={colors.warning}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.commentInput}
        placeholder="Share your experience (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={MAX_REVIEW_LENGTH}
        testID={testID ? `${testID}-comment-input` : undefined}
      />
      {error !== "" && (
        <Text style={styles.errorText} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}
      <CustomButton
        text={submitting ? "Submitting..." : initial ? "Update Review" : "Submit Review"}
        onPress={handleSubmit}
        disabled={submitting}
        testID={testID ? `${testID}-submit-btn` : undefined}
      />
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentInput: {
    width: "100%",
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 10,
  },
});
