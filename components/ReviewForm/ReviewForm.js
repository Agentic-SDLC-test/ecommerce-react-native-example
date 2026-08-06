import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";
import StarRating from "../StarRating";
import { remainingCommentChars, REVIEW_COMMENT_MAX_LENGTH } from "../../utils/reviews";

// Presentational only — the owning screen holds the state and calls the API.
const ReviewForm = ({
  mode = "create",
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  onDelete,
  isBusy = false,
  hiddenNotice = false,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.heading} testID={testID ? `${testID}-heading` : undefined}>
        {mode === "edit" ? "Your review" : "Write a review"}
      </Text>
      {hiddenNotice ? (
        <Text style={styles.noticeText} testID={testID ? `${testID}-hidden-notice` : undefined}>
          This review is currently not shown to other shoppers.
        </Text>
      ) : (
        <></>
      )}
      <StarRating
        editable
        value={rating}
        onChange={setRating}
        size={28}
        testID={testID ? `${testID}-rating` : undefined}
      />
      <TextInput
        style={styles.commentInput}
        placeholder={"Share what you thought (optional)"}
        placeholderTextColor={colors.muted}
        value={comment}
        onChangeText={setComment}
        maxLength={REVIEW_COMMENT_MAX_LENGTH}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        testID={testID ? `${testID}-comment` : undefined}
      />
      <Text style={styles.counterText} testID={testID ? `${testID}-counter` : undefined}>
        {`${remainingCommentChars(comment)} characters left`}
      </Text>
      <CustomButton
        text={mode === "edit" ? "Update review" : "Submit review"}
        onPress={onSubmit}
        disabled={isBusy || !rating}
        testID={testID ? `${testID}-submit-btn` : undefined}
      />
      {mode === "edit" ? (
        <TouchableOpacity
          style={styles.removeButton}
          disabled={isBusy}
          onPress={onDelete}
          testID={testID ? `${testID}-remove-btn` : undefined}
        >
          <Text style={styles.removeText}>Remove review</Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  heading: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  noticeText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 5,
  },
  commentInput: {
    width: "100%",
    minHeight: 80,
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.light,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.muted,
    color: colors.dark,
  },
  counterText: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 11,
    color: colors.muted,
    fontWeight: "bold",
  },
  removeButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  removeText: {
    color: colors.danger,
    fontWeight: "bold",
  },
});
