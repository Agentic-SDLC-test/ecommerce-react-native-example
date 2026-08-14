import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../CustomInput";
import CustomButton from "../CustomButton";
import CustomAlert from "../CustomAlert/CustomAlert";

// Modal-style panel for submitting or editing a review: a 5-star picker plus
// an optional multiline text field. The parent screen owns the API call and
// passes it in via onSubmit, matching this codebase's screen-owns-orchestration
// convention (this component stays presentational + local form state only).
const ReviewForm = ({
  visible,
  initialRating = 0,
  initialText = "",
  isEdit = false,
  onSubmit,
  onCancel,
  error = "",
  testID,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (visible) {
      setRating(initialRating);
      setText(initialText);
    }
  }, [visible, initialRating, initialText]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} testID={testID}>
      <View style={styles.panel}>
        <Text style={styles.heading} testID={testID ? `${testID}-heading` : undefined}>
          {isEdit ? "Edit your Review" : "Write a Review"}
        </Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              testID={testID ? `${testID}-star-${star}` : undefined}
            >
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={32}
                color={colors.warning}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        <CustomInput
          testID={testID ? `${testID}-text-input` : undefined}
          placeholder="Share details of your experience (optional)"
          value={text}
          setValue={setText}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        <CustomAlert testID={testID ? `${testID}-alert` : undefined} message={error} type="error" />
        <CustomButton
          testID={testID ? `${testID}-submit-btn` : undefined}
          text={isEdit ? "Update Review" : "Submit Review"}
          disabled={rating < 1}
          onPress={() => onSubmit?.({ rating, text })}
        />
        <TouchableOpacity
          testID={testID ? `${testID}-cancel-btn` : undefined}
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  overlay: {
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 10,
  },
  panel: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  starsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  cancelButton: {
    alignItems: "center",
    padding: 5,
  },
  cancelButtonText: {
    color: colors.muted,
    fontWeight: "600",
  },
});
