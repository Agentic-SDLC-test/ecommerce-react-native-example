import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
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

const ProductReviewScreen = ({ navigation, route }) => {
  const { product, currentUserReview } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isloading, setIsloading] = useState(false);

  const initialiseForm = (review) => {
    if (!review) return;
    setRating(review.rating || 0);
    setComment(review.comment || "");
  };

  const validateForm = () => {
    const trimmedComment = comment.trim();
    if (!rating) {
      return { valid: false, message: "Please select a rating" };
    }
    if (trimmedComment.length < 10 || trimmedComment.length > 280) {
      return {
        valid: false,
        message: "Comment must be between 10 and 280 characters",
      };
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      setAlertType("error");
      setError(validation.message);
      return;
    }

    setIsloading(true);
    setError("");
    try {
      const result = await api.saveReview({
        productId: product._id,
        rating,
        comment: comment.trim(),
      });

      if (result.success) {
        setAlertType("success");
        setError(result.message);
        setTimeout(() => {
          navigation.goBack();
        }, 300);
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (submitError) {
      setAlertType("error");
      setError(submitError.message);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    initialiseForm(currentUserReview);
  }, [currentUserReview]);

  return (
    <KeyboardAvoidingView style={styles.container} testID="product-review-screen">
      <ProgressDialog visible={isloading} label={"Saving review..."} />
      <StatusBar testID="product-review-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="product-review-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        testID="product-review-scroll"
      >
        <View style={styles.screenNameContainer}>
          <Text style={styles.screenNameText} testID="product-review-heading">
            {currentUserReview ? "Edit Your Review" : "Write a Review"}
          </Text>
          <Text style={styles.screenNameParagraph} testID="product-review-product-title">
            {product?.title}
          </Text>
        </View>

        <CustomAlert
          message={error}
          type={alertType}
          testID="product-review-alert"
        />

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRating(value)}
                testID={`product-review-star-${value}`}
              >
                <Ionicons
                  name={value <= rating ? "star" : "star-outline"}
                  size={34}
                  color={colors.warning}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Comment</Text>
          <CustomInput
            value={comment}
            setValue={setComment}
            placeholder={"Share your review"}
            placeholderTextColor={colors.muted}
            radius={10}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={280}
            inputStyle={styles.commentInput}
            testID="product-review-comment-input"
          />

          <Text
            style={styles.characterCount}
            testID="product-review-character-count"
          >
            {comment.trim().length}/280
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <CustomButton
          text={currentUserReview ? "Save Changes" : "Save Review"}
          onPress={handleSubmit}
          disabled={isloading}
          testID="product-review-submit-btn"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ProductReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    marginBottom: 10,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
    color: colors.dark,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    elevation: 2,
  },
  fieldLabel: {
    color: colors.muted,
    fontWeight: "700",
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  commentInput: {
    minHeight: 140,
    paddingTop: 12,
  },
  characterCount: {
    textAlign: "right",
    color: colors.muted,
    fontSize: 12,
  },
  bottomContainer: {
    width: "100%",
  },
});
