import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import ProgressDialog from "react-native-progress-dialog";
import RatingStars from "../../components/RatingStars";
import {
  validateReviewDraft,
  buildReviewPayload,
  canSubmitReview,
  eligibilityMessage,
  resolveEligibility,
  resolveVisibility,
} from "../../utils/reviews";
import {
  REVIEW_ELIGIBILITY,
  REVIEW_VISIBILITIES,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_HIDDEN_AUTHOR_NOTICE,
} from "../../constants/Reviews";

// One screen serves the first submission and every later edit, so there is one
// flow to learn. Eligibility is re-verified on mount rather than trusted from
// the route param, so a stale navigation cannot present a form to an ineligible
// shopper — and the server refuses the write regardless.
const WriteReviewScreen = ({ navigation, route }) => {
  const { product, myReview } = route.params;
  const [isloading, setIsloading] = useState(false);
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [rating, setRating] = useState(myReview?.rating || 0);
  const [text, setText] = useState(myReview?.text || "");
  const [eligibility, setEligibility] = useState(
    REVIEW_ELIGIBILITY.NO_PURCHASE
  );
  const [existingReview, setExistingReview] = useState(myReview || null);

  //method to re-verify with the server whether this shopper may review
  const fetchEligibility = () => {
    setIsloading(true);
    api
      .getReviewEligibility(product?._id)
      .then((result) => {
        setEligibility(resolveEligibility(result));
        if (result?.data?.my_review) {
          setExistingReview(result.data.my_review);
          setRating(result.data.my_review.rating);
          setText(result.data.my_review.text || "");
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        console.log("[reviews] load_failed", error?.message);
      });
  };

  //method to set the rating and clear any prior validation message
  const handleRate = (value) => {
    setRating(value);
    setError("");
  };

  //method to publish or update the review
  const handleSubmit = () => {
    const check = validateReviewDraft({ rating, text });
    if (!check.valid) {
      setAlertType("error");
      setError(check.message);
      return;
    }
    setIsloading(true);
    api
      .submitReview(
        buildReviewPayload({ productId: product?._id, rating, text })
      )
      .then((result) => {
        setIsloading(false);
        if (result.success) {
          setAlertType("success");
          setError(result.message);
          navigation.goBack();
        } else {
          setAlertType("error");
          setError(result.message);
        }
      })
      .catch((error) => {
        setIsloading(false);
        setAlertType("error");
        setError(error.message);
        console.log("[reviews] submit_failed", error?.message);
      });
  };

  //verify eligibility on initial render
  useEffect(() => {
    fetchEligibility();
  }, []);

  return (
    <View style={styles.container} testID="write-review-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="write-review-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="write-review-back-btn"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="write-review-heading">
            {existingReview ? "Edit Review" : "Write a Review"}
          </Text>
        </View>
        <View>
          <Text
            style={styles.screenNameParagraph}
            testID="write-review-product-title"
          >
            {product?.title}
          </Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="write-review-alert" />
      <ScrollView
        testID="write-review-scroll"
        style={styles.bodyContainer}
        showsVerticalScrollIndicator={false}
      >
        {canSubmitReview(eligibility) ? (
          <View style={styles.formContainer}>
            {existingReview &&
              resolveVisibility(existingReview) ===
                REVIEW_VISIBILITIES.HIDDEN && (
                <Text
                  style={styles.mutedText}
                  testID="write-review-hidden-notice"
                >
                  {REVIEW_HIDDEN_AUTHOR_NOTICE}
                </Text>
              )}
            <Text style={styles.fieldLabel} testID="write-review-rating-label">
              Your rating
            </Text>
            <RatingStars
              rating={rating}
              onRate={handleRate}
              size={32}
              testID="write-review-rating"
            />
            <Text style={styles.fieldLabel} testID="write-review-text-label">
              Your review
            </Text>
            <CustomInput
              value={text}
              setValue={setText}
              placeholder={"Share what you thought (optional)"}
              placeholderTextColor={colors.muted}
              radius={5}
              maxLength={REVIEW_TEXT_MAX_LENGTH}
              multiline
              testID="write-review-text-input"
            />
            <Text style={styles.counterText} testID="write-review-counter">
              {`${text.length}/${REVIEW_TEXT_MAX_LENGTH}`}
            </Text>
            <CustomButton
              testID="write-review-submit-btn"
              text={existingReview ? "Save changes" : "Publish review"}
              disabled={isloading}
              onPress={handleSubmit}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.mutedText} testID="write-review-ineligible-text">
              {eligibilityMessage(eligibility)}
            </Text>
            <CustomButton
              testID="write-review-back-cta"
              text={"Back"}
              onPress={() => navigation.goBack()}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WriteReviewScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 0,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 10,
    fontSize: 15,
  },
  bodyContainer: { flex: 1, width: "100%", padding: 5 },
  formContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.muted,
    marginTop: 15,
    marginBottom: 5,
  },
  counterText: {
    fontSize: 11,
    color: colors.muted,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  mutedText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 15,
  },
});
