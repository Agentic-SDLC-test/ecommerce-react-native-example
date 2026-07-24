import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import RatingStars from "../../components/Reviews/RatingStars";

const ViewReviewDetailScreen = ({ navigation, route }) => {
  const { reviewDetail } = route.params;
  const [review, setReview] = useState(reviewDetail);
  const [isloading, setIsloading] = useState(false);
  const [label] = useState("Loading..");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(reviewDetail?.status);
  const [items, setItems] = useState([
    { label: "Published", value: "published" },
    { label: "Hidden", value: "hidden" },
    { label: "Removed", value: "removed" },
  ]);

  const statusDisable = review?.status === "removed";

  const buildModerationMeta = (currentReview) => {
    return [
      `Order # ${currentReview?.orderId}`,
      `Created ${new Date(currentReview?.createdAt).toLocaleString()}`,
      `Updated ${new Date(currentReview?.updatedAt).toLocaleString()}`,
      currentReview?.moderatedAt
        ? `Moderated ${new Date(currentReview?.moderatedAt).toLocaleString()}`
        : "Not moderated yet",
      currentReview?.moderatedBy ? `Moderator ${currentReview?.moderatedBy}` : null,
      currentReview?.verifiedPurchase ? "Verified purchase" : "Unverified purchase",
    ].filter(Boolean);
  };

  const moderationMeta = useMemo(() => buildModerationMeta(review), [review]);

  const handleUpdateStatus = (reviewId) => {
    setIsloading(true);
    setError("");
    setAlertType("error");

    api
      .updateReviewStatus(reviewId, value)
      .then((result) => {
        if (result.success === true) {
          setReview((currentReview) => ({
            ...currentReview,
            ...result.data,
          }));
          setValue(result.data.status);
          setError(`Review status updated to ${result.data.status}`);
          setAlertType("success");
        } else {
          setError(result.message);
        }
        setIsloading(false);
      })
      .catch((requestError) => {
        setAlertType("error");
        setError(requestError.message);
        setIsloading(false);
      });
  };

  useEffect(() => {
    setReview(reviewDetail);
    setValue(reviewDetail?.status);
  }, [reviewDetail]);

  return (
    <View style={styles.container} testID="view-review-detail-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-review-detail-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="view-review-detail-back-btn"
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
        <Text style={styles.screenNameText} testID="view-review-detail-heading">
          Review Details
        </Text>
        <Text
          style={styles.screenNameParagraph}
          testID="view-review-detail-subtitle"
        >
          Moderate a verified-purchase review
        </Text>
      </View>
      <CustomAlert
        message={error}
        type={alertType}
        testID="view-review-detail-alert"
      />
      <ScrollView
        testID="view-review-detail-scroll"
        style={styles.bodyContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <Text style={styles.panelHeading}>Product</Text>
          <Text style={styles.panelValue}>{review?.productTitle}</Text>
          <Text style={styles.panelSubValue}>Reviewer: {review?.userName}</Text>
          <Text style={styles.panelSubValue}>Status: {review?.status}</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelHeading}>Rating</Text>
          <RatingStars readonly value={review?.rating || 0} testID="view-review-detail-rating" />
          <Text style={styles.panelComment}>{review?.comment}</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelHeading}>Moderation metadata</Text>
          {moderationMeta.map((item, index) => (
            <Text
              key={index}
              style={styles.panelSubValue}
              testID={`view-review-detail-meta-${index}`}
            >
              {item}
            </Text>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <DropDownPicker
          style={{ width: 200 }}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          disabled={statusDisable}
          disabledStyle={{
            backgroundColor: colors.light,
            borderColor: colors.white,
          }}
          labelStyle={{ color: colors.muted }}
          testID="view-review-detail-status-dropdown"
        />
        {statusDisable ? (
          <CustomButton
            text={"Update"}
            disabled
            testID="view-review-detail-update-btn"
          />
        ) : (
          <CustomButton
            text={"Update"}
            onPress={() => handleUpdateStatus(review?._id)}
            testID="view-review-detail-update-btn"
          />
        )}
      </View>
    </View>
  );
};

export default ViewReviewDetailScreen;

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
  panel: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    elevation: 3,
  },
  panelHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 8,
  },
  panelValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
  },
  panelSubValue: {
    marginTop: 6,
    color: colors.muted,
  },
  panelComment: {
    marginTop: 12,
    color: colors.dark,
    lineHeight: 20,
  },
  bottomContainer: {
    width: "100%",
    paddingVertical: 16,
    gap: 10,
  },
});
