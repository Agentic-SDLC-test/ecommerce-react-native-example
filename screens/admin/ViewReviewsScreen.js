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
import ProgressDialog from "react-native-progress-dialog";
import ReviewList from "../../components/ReviewList/ReviewList";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "visible", label: "Visible" },
  { key: "hidden", label: "Hidden" },
];

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [visibility, setVisibility] = useState("all");

  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews({ visibility })
      .then((result) => {
        if (result.success) {
          setReviews(result.data.reviews);
          setError("");
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

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  const handleHide = (review) => {
    api
      .setReviewVisibility(review._id, false)
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
          fetchReviews();
        } else {
          setError(result.message);
          setAlertType("error");
        }
      })
      .catch((err) => {
        setError(err.message);
        setAlertType("error");
      });
  };

  const handleShow = (review) => {
    api
      .setReviewVisibility(review._id, true)
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
          fetchReviews();
        } else {
          setError(result.message);
          setAlertType("error");
        }
      })
      .catch((err) => {
        setError(err.message);
        setAlertType("error");
      });
  };

  const handleRemove = (review) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to permanently remove this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            api
              .deleteReview(review._id)
              .then((result) => {
                if (result.success) {
                  setError(result.message);
                  setAlertType("success");
                  fetchReviews();
                } else {
                  setError(result.message);
                  setAlertType("error");
                }
              })
              .catch((err) => {
                setError(err.message);
                setAlertType("error");
              });
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchReviews();
  }, [visibility]);

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-reviews-status-bar" />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="view-reviews-back-btn"
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
        <Text style={styles.screenNameText} testID="view-reviews-heading">
          Reviews
        </Text>
        <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
          Moderate customer reviews
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              visibility === option.key && styles.filterButtonActive,
            ]}
            onPress={() => setVisibility(option.key)}
            testID={`view-reviews-filter-${option.key}`}
          >
            <Text
              style={[
                styles.filterText,
                visibility === option.key && styles.filterTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {reviews.length === 0 ? (
          <Text testID="view-reviews-empty-text">No reviews found.</Text>
        ) : (
          reviews.map((review, index) => (
            <ReviewList
              key={review._id}
              item={review}
              onHide={handleHide}
              onShow={handleShow}
              onRemove={handleRemove}
              testID={`view-reviews-item-${index}`}
            />
          ))
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
  topBarContainer: {
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
  filterContainer: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 10,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "bold",
  },
  filterTextActive: {
    color: colors.white,
  },
});
