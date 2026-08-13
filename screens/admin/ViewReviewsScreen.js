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
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import StarRatingDisplay from "../../components/Reviews/StarRatingDisplay";
import CustomButton from "../../components/CustomButton";

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews({ visibility: "all" })
      .then((result) => {
        if (result.success) {
          setReviews(result.data);
          setFoundItems(result.data);
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

  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews?.filter((item) => {
        return (
          item?.productTitle?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.user?.name?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.body?.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  const handleToggleVisibility = (review) => {
    const newVisible = !review.isVisible;
    const newStatus = newVisible ? "visible" : "hidden";
    setIsloading(true);
    api
      .updateReviewVisibility(review._id, {
        isVisible: newVisible,
        moderationStatus: newStatus,
      })
      .then((result) => {
        if (result.success) {
          fetchReviews();
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

  const handleRemove = (reviewId) => {
    Alert.alert("Remove Review", "Are you sure you want to remove this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setIsloading(true);
          api
            .removeReview(reviewId, "Removed by admin")
            .then((result) => {
              if (result.success) {
                fetchReviews();
              } else {
                setError(result.message);
              }
              setIsloading(false);
            })
            .catch((err) => {
              setIsloading(false);
              setError(err.message);
            });
        },
      },
    ]);
  };

  useEffect(() => {
    filter();
  }, [filterItem]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const getStatusLabel = (review) => {
    if (review.moderationStatus === "removed") return "Removed";
    if (review.moderationStatus === "hidden") return "Hidden";
    return "Visible";
  };

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="view-reviews-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
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
      <CustomInput
        radius={5}
        placeholder={"Search..."}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />
      <ScrollView
        testID="view-reviews-scroll"
        style={styles.bodyContainer}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems?.map((review, index) => (
          <View
            key={review._id}
            style={styles.reviewCard}
            testID={`view-reviews-card-${index}`}
          >
            <Text style={styles.productTitle}>{review.productTitle}</Text>
            <Text style={styles.reviewerName}>
              {review.user?.name} · {getStatusLabel(review)}
            </Text>
            <StarRatingDisplay rating={review.rating} size={14} />
            <Text style={styles.bodyPreview} numberOfLines={3}>
              {review.body}
            </Text>
            <View style={styles.actionsRow}>
              {review.moderationStatus !== "removed" && (
                <CustomButton
                  text={review.isVisible ? "Hide" : "Show"}
                  onPress={() => handleToggleVisibility(review)}
                  testID={`view-reviews-toggle-${index}`}
                />
              )}
              {review.moderationStatus !== "removed" && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(review._id)}
                  testID={`view-reviews-remove-${index}`}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
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
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewerName: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  bodyPreview: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  removeBtn: {
    padding: 10,
  },
  removeText: {
    color: colors.danger,
    fontWeight: "bold",
    fontSize: 14,
  },
});
