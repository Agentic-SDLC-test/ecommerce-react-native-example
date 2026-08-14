import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewList from "../../components/ReviewList";
import ProgressDialog from "react-native-progress-dialog";

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);

  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  //method the fetch all reviews (any status) from server using API call
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

  //method to hide/unhide a review by toggling its status
  const handleModerate = (review, nextStatus) => {
    setIsloading(true);
    api
      .updateReviewStatus(review._id, nextStatus)
      .then((result) => {
        if (result.success) {
          fetchReviews();
          setError(result.message);
          setAlertType("success");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        console.log("error", error);
      });
  };

  //method to permanently remove a review
  const handleDelete = (reviewId) => {
    setIsloading(true);
    api
      .deleteReview(reviewId)
      .then((result) => {
        if (result.success) {
          fetchReviews();
          setError(result.message);
          setAlertType("success");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        console.log("error", error);
      });
  };

  //method for confirm dialog before a destructive remove
  const showConfirmDialog = (reviewId) => {
    return Alert.alert("Are your sure?", "Are you sure you want to remove this review?", [
      {
        text: "Yes",
        onPress: () => {
          handleDelete(reviewId);
        },
      },
      {
        text: "No",
      },
    ]);
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
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">View Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
            Moderate customer reviews
          </Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />}
      >
        <ReviewList
          testID="view-reviews-list"
          reviews={reviews}
          isAdmin={true}
          onModerate={handleModerate}
          onRemove={(review) => showConfirmDialog(review._id)}
          emptyText="No reviews found."
        />
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
