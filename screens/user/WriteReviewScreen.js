import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import * as api from "../../api";
import { ReviewRules, validateReview } from "@agentic-sdlc-test/easybuy-api-client/domain";
import StarRating from "../../components/StarRating";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

const WriteReviewScreen = ({ navigation, route }) => {
  const { product, review } = route.params;
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isloading, setIsloading] = useState(false);

  //method to validate input then submit or edit the review using API call
  const handleSubmit = () => {
    const validationError = validateReview({ rating, comment });
    if (validationError) {
      setAlertType("error");
      setError(validationError);
      return;
    }

    setIsloading(true);
    api
      .submitReview(product._id, rating, comment.trim())
      .then((result) => {
        setIsloading(false);
        if (result.success) {
          navigation.goBack();
        } else {
          setAlertType("error");
          setError(result.message || result.msg);
        }
      })
      .catch((error) => {
        setIsloading(false);
        setAlertType("error");
        setError(error.message);
        console.log("error", error);
      });
  };

  return (
    <KeyboardAvoidingView testID="write-review-screen" style={styles.container}>
      <StatusBar testID="write-review-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={"Submitting ..."} />
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
          {review ? "Edit your review" : "Write a review"}
        </Text>
        <Text style={styles.screenNameParagraph} testID="write-review-product-title">
          {product?.title}
        </Text>
      </View>
      <CustomAlert testID="write-review-alert" message={error} type={alertType} />
      <View style={styles.starsContainer}>
        <StarRating rating={rating} size={36} onChange={setRating} testID="write-review-stars" />
      </View>
      <CustomInput
        testID="write-review-comment"
        value={comment}
        setValue={setComment}
        placeholder={"Share your experience (optional)"}
        placeholderTextColor={colors.muted}
        radius={5}
        multiline
        maxLength={ReviewRules.COMMENT_MAX_LENGTH}
      />
      <Text style={styles.counterText} testID="write-review-count">
        {`${comment.length}/${ReviewRules.COMMENT_MAX_LENGTH}`}
      </Text>
      <View style={styles.buttomContainer}>
        <CustomButton testID="write-review-submit-btn" text={"Submit"} onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
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
  starsContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  counterText: {
    width: "100%",
    textAlign: "right",
    color: colors.muted,
    fontSize: 12,
  },
  buttomContainer: {
    marginTop: 10,
    width: "100%",
  },
});
