import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

const ReviewFormScreen = ({ navigation, route }) => {
  const { productId, productTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [reason, setReason] = useState("");
  const [isloading, setIsloading] = useState(false);
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  const loadMyReview = () => {
    setIsloading(true);
    api
      .getMyProductReview(productId)
      .then((result) => {
        if (result.success) {
          setEligible(result.data.eligible);
          setReason(result.data.reason || "");
          setExistingReview(result.data.existingReview);
          if (result.data.existingReview) {
            setRating(result.data.existingReview.rating);
            setBody(result.data.existingReview.body);
          }
          setError("");
        } else {
          setError(result.message);
        }
        setIsloading(false);
      })
      .catch((err) => {
        setIsloading(false);
        setError(err.message);
      });
  };

  const handleSubmit = () => {
    const trimmedBody = body.trim();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars");
      setAlertType("error");
      return;
    }
    if (!trimmedBody || trimmedBody.length > 500) {
      setError("Review must be between 1 and 500 characters");
      setAlertType("error");
      return;
    }

    setIsloading(true);
    setLabel("Saving review...");
    api
      .upsertProductReview(productId, { rating, body: trimmedBody })
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
          setTimeout(() => navigation.goBack(), 1000);
        } else {
          setError(result.message);
          setAlertType("error");
        }
        setIsloading(false);
      })
      .catch((err) => {
        setIsloading(false);
        setError(err.message);
        setAlertType("error");
      });
  };

  useEffect(() => {
    loadMyReview();
  }, []);

  const canSubmit = eligible && rating >= 1 && body.trim().length > 0;

  return (
    <View style={styles.container} testID="review-form-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="review-form-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.bodyContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading} testID="review-form-heading">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </Text>
        <Text style={styles.productTitle} testID="review-form-product-title">
          {productTitle}
        </Text>
        <CustomAlert message={error} type={alertType} testID="review-form-alert" />

        {!eligible ? (
          <View style={styles.ineligibleContainer} testID="review-form-ineligible">
            <Text style={styles.ineligibleText}>{reason}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Your Rating</Text>
            <View style={styles.starsContainer} testID="review-form-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  testID={`review-form-star-${star}`}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={36}
                    color={star <= rating ? colors.warning : colors.muted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Your Review</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={5}
              maxLength={500}
              value={body}
              onChangeText={setBody}
              placeholder="Share your experience with this product..."
              placeholderTextColor={colors.muted}
              testID="review-form-body-input"
            />
            <Text style={styles.charCount} testID="review-form-char-count">
              {body.trim().length}/500
            </Text>

            <View style={styles.submitContainer}>
              <CustomButton
                text={existingReview ? "Update Review" : "Submit Review"}
                onPress={handleSubmit}
                disabled={!canSubmit}
                testID="review-form-submit-btn"
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ReviewFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
    paddingBottom: 0,
  },
  topBarContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  bodyContainer: {
    flex: 1,
    width: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.muted,
    marginTop: 10,
  },
  productTitle: {
    fontSize: 16,
    color: colors.dark,
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
    marginTop: 12,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 14,
    elevation: 2,
  },
  charCount: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
    marginTop: 4,
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  ineligibleContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    elevation: 2,
  },
  ineligibleText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
});
