import { StyleSheet, StatusBar, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import StarRatingInput from "../../components/StarRatingInput";
import * as api from "../../api";

const WriteReviewScreen = ({ navigation, route }) => {
  const { product, existingReview } = route.params;
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [text, setText] = useState(existingReview?.text || "");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isDisable, setIsDisbale] = useState(false);

  //method to validate and submit or update a review
  const handleSubmit = () => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setAlertType("error");
      setError("Please select a rating between 1 and 5");
      return;
    }
    const trimmedText = text.trim();
    if (trimmedText.length > 1000) {
      setAlertType("error");
      setError("Review text must be 1000 characters or fewer");
      return;
    }

    setIsDisbale(true);
    setError("");

    const payload = { productId: product._id, rating, text: trimmedText };
    const request = existingReview
      ? api.updateReview(existingReview._id, payload)
      : api.submitReview(payload);

    request
      .then((result) => {
        setIsDisbale(false);
        if (result.success) {
          navigation.goBack();
        } else {
          setAlertType("error");
          setError(result.message);
        }
      })
      .catch((error) => {
        setIsDisbale(false);
        setAlertType("error");
        setError(error.message);
        console.log("error", error);
      });
  };

  return (
    <View style={styles.container} testID="write-review-screen">
      <StatusBar testID="write-review-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="write-review-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
        <Text style={styles.heading} testID="write-review-heading">
          {existingReview ? "Edit your review" : "Write a review"}
        </Text>
        <View></View>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.productTitle} testID="write-review-product-title">
          {product?.title}
        </Text>
        <StarRatingInput value={rating} onChange={setRating} testID="write-review-stars" />
        <CustomInput
          placeholder="Share your experience (optional)"
          value={text}
          setValue={setText}
          maxLength={1000}
          multiline
          numberOfLines={4}
          testID="write-review-text-input"
        />
        <CustomAlert message={error} type={alertType} testID="write-review-alert" />
        <CustomButton
          text={existingReview ? "Update Review" : "Submit Review"}
          onPress={handleSubmit}
          disabled={isDisable}
          testID="write-review-submit-btn"
        />
      </View>
    </View>
  );
};

export default WriteReviewScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.light,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
  },
  bodyContainer: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 20,
    textAlign: "center",
  },
});
