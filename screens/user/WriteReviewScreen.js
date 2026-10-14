import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput/";
import CustomButton from "../../components/CustomButton";
import StarRating from "../../components/StarRating";
import {
  ReviewEligibility,
  REVIEW_TEXT_MAX,
  validateReview,
} from "@agentic-sdlc-test/easybuy-api-client/domain";

const WriteReviewScreen = ({ navigation, route }) => {
  const { productId, productTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [existing, setExisting] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [isloading, setIsloading] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [error, setError] = useState("");

  //method to load the caller's own review (if any) and eligibility for this product
  const fetchMyReview = () => {
    setIsloading(true);
    api
      .getMyReview(productId)
      .then((result) => {
        if (result.success) {
          setEligibility(result.data.eligibility);
          if (result.data.review) {
            setExisting(result.data.review);
            setRating(result.data.review.rating);
            setText(result.data.review.text);
          }
          setError("");
        } else {
          setAlertType("error");
          setError(result.message);
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setAlertType("error");
        setError(error.message);
        console.log("error", error);
      });
  };

  useEffect(() => {
    fetchMyReview();
  }, []);

  //method to submit a new review or save changes to the existing one
  const handleSubmit = () => {
    const message = validateReview({ rating, text });
    if (message) {
      setAlertType("error");
      setError(message);
      return;
    }

    setIsloading(true);
    const request = existing
      ? api.updateReview(existing._id, { rating, text })
      : api.createReview({ productId, rating, text });

    request
      .then((result) => {
        setIsloading(false);
        if (result.success) {
          navigation.goBack();
          return;
        }
        setAlertType("error");
        setError(result.message);
        if (result.message?.startsWith("You have already reviewed")) {
          fetchMyReview();
        }
      })
      .catch((error) => {
        setIsloading(false);
        setAlertType("error");
        setError(error.message);
        console.log("error", error);
      });
  };

  const isEligible = eligibility === ReviewEligibility.ELIGIBLE;

  return (
    <View style={styles.container} testID="write-review-screen">
      <ProgressDialog visible={isloading} label={"Loading..."} />
      <StatusBar testID="write-review-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
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
        <Text style={styles.screenNameText} testID="write-review-heading">
          {existing ? "Edit your review" : "Write a review"}
        </Text>
        <Text style={styles.screenNameParagraph} testID="write-review-subtitle">{productTitle}</Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="write-review-alert" />
      <ScrollView
        testID="write-review-scroll"
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      >
        {existing?.hidden && (
          <Text style={styles.hiddenBanner} testID="write-review-hidden-banner">
            This review has been hidden by the store and is not visible to other
            shoppers.
          </Text>
        )}
        {!isEligible && eligibility != null && (
          <Text style={styles.ineligibleText} testID="write-review-ineligible-message">
            {eligibility === ReviewEligibility.NOT_DELIVERED
              ? "You can review this product once your order is delivered."
              : "Only customers who have received this product can review it."}
          </Text>
        )}
        <View style={styles.starsContainer}>
          <StarRating
            testID="write-review-stars"
            rating={rating}
            size={36}
            onChange={isEligible ? setRating : undefined}
          />
        </View>
        <CustomInput
          testID="write-review-text"
          placeholder={"Share what you liked or disliked (optional)"}
          value={text}
          setValue={isEligible ? setText : () => {}}
          multiline
          numberOfLines={5}
          maxLength={REVIEW_TEXT_MAX}
        />
        <Text style={styles.charCountText} testID="write-review-char-count">
          {text.length}/{REVIEW_TEXT_MAX}
        </Text>
        <CustomButton
          testID="write-review-submit-btn"
          text={existing ? "Save changes" : "Submit review"}
          disabled={isloading || !isEligible}
          onPress={handleSubmit}
        />
      </ScrollView>
    </View>
  );
};

export default WriteReviewScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
  },
  hiddenBanner: {
    width: "100%",
    backgroundColor: colors.light,
    color: colors.muted,
    fontSize: 13,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  ineligibleText: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 15,
  },
  starsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  charCountText: {
    width: "100%",
    textAlign: "right",
    color: colors.muted,
    fontSize: 12,
    marginBottom: 15,
  },
});
