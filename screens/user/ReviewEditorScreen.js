import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { validateReview } from "../../utils/reviews";

const ReviewEditorScreen = ({ navigation, route }) => {
  const { product, existingReview, reviewId } = route.params;
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [existingReviewId, setExistingReviewId] = useState(
    existingReview?._id || reviewId || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  const loadDraft = () => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || "");
      setExistingReviewId(existingReview._id || reviewId || null);
      return;
    }

    if (!product?._id) {
      return;
    }

    api
      .getProductReviews(product._id)
      .then((result) => {
        if (result.success && result.data?.viewer?.review) {
          setRating(result.data.viewer.review.rating || 0);
          setComment(result.data.viewer.review.comment || "");
          setExistingReviewId(result.data.viewer.review._id || null);
        }
      })
      .catch(() => {});
  };

  const submitReview = () => {
    const validationError = validateReview(rating, comment);
    if (validationError) {
      setAlertType("error");
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setAlertType("error");

    const payload = {
      ...(existingReviewId ? {} : { productId: product?._id }),
      rating,
      comment: comment.trim(),
    };
    const request = existingReviewId
      ? api.updateReview(existingReviewId, payload)
      : api.createReview(payload);

    request
      .then((result) => {
        if (result.success) {
          setAlertType("success");
          setError(result.message);
          setTimeout(() => {
            navigation.goBack();
          }, 500);
          return;
        }

        setAlertType("error");
        setError(result.message || "Unable to save review");
      })
      .catch((requestError) => {
        setAlertType("error");
        setError(requestError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadDraft();
  }, [product?._id]);

  return (
    <View style={styles.container} testID="review-editor-screen">
      <StatusBar testID="review-editor-status-bar"></StatusBar>
      <ProgressDialog visible={isLoading} label="Saving review..." />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="review-editor-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText} testID="review-editor-heading">
          {existingReviewId ? "Edit Review" : "Write Review"}
        </Text>
        <Text style={styles.screenNameParagraph} testID="review-editor-subtitle">
          {product?.title}
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="review-editor-alert" />
      <ScrollView
        style={styles.bodyContainer}
        showsVerticalScrollIndicator={false}
        testID="review-editor-scroll"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your rating</Text>
          <View style={styles.starRow} testID="review-editor-star-row">
            {Array.from({ length: 5 }).map((_, index) => {
              const currentRating = index + 1;

              return (
                <TouchableOpacity
                  key={`review-rating-${currentRating}`}
                  onPress={() => setRating(currentRating)}
                  testID={`review-editor-star-btn-${currentRating}`}
                >
                  <Ionicons
                    name={currentRating <= rating ? "star" : "star-outline"}
                    size={32}
                    color={colors.warning}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helperText}>
            Add a short review comment. It is required and limited to 500
            characters.
          </Text>
          <CustomInput
            value={comment}
            setValue={setComment}
            placeholder="Share what you think about this product"
            radius={10}
            maxLength={500}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            testID="review-editor-comment-input"
          />
          <Text style={styles.characterCount} testID="review-editor-character-count">
            {comment.trim().length}/500
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            text={existingReviewId ? "Update Review" : "Save Review"}
            onPress={submitReview}
            disabled={isLoading}
            testID="review-editor-submit-btn"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ReviewEditorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: "center",
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 8,
    fontSize: 15,
    color: colors.muted,
  },
  bodyContainer: {
    width: "100%",
    flex: 1,
    marginTop: 10,
  },
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  helperText: {
    marginTop: 16,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  characterCount: {
    alignSelf: "flex-end",
    color: colors.muted,
    fontSize: 12,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 16,
  },
});
