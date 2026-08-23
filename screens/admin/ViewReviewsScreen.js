import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import ReviewList from "../../components/ReviewList/ReviewList";

const ViewReviewsScreen = ({ navigation, route }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);

  //method the fetch all reviews (including hidden) from server using API call
  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews()
      .then((result) => {
        if (result.success) {
          setReviews(result.data);
          setError("");
        } else {
          setError(result.message);
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        console.log("error", error);
      });
  };

  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  //method to hide/show a review, then refresh the list
  const handleToggleVisibility = (review) => {
    const nextVisible = review.status !== "visible";
    setIsloading(true);
    api
      .setReviewVisibility(review._id, nextVisible)
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        fetchReviews();
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        setAlertType("error");
        console.log("error", error);
      });
  };

  //method to remove a review, then refresh the list
  const handleRemove = (review) => {
    setIsloading(true);
    api
      .deleteReview(review._id)
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        fetchReviews();
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        setAlertType("error");
        console.log("error", error);
      });
  };

  //fetch the reviews on initial render
  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-reviews-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="view-reviews-back-btn"
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
          <Text style={styles.screenNameText} testID="view-reviews-heading">View Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">Moderate product reviews</Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {reviews && reviews.length === 0 ? (
          <Text testID="view-reviews-empty-text">No reviews found!</Text>
        ) : (
          <ReviewList
            reviews={reviews}
            admin={true}
            onToggleVisibility={handleToggleVisibility}
            onRemove={handleRemove}
            testID="view-reviews-list"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ViewReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
});
