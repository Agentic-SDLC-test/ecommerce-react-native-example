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
import { AntDesign } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput/";
import ProgressDialog from "react-native-progress-dialog";

const ViewReviewsScreen = ({ navigation, route }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews()
      .then((result) => {
        if (result.success) {
          setReviews(result.data || []);
          setFoundItems(result.data || []);
          setError("");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        setAlertType("error");
        console.log("error", error);
      });
  };

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews.filter((review) => {
        const productTitleMatch = review.productTitle?.toLowerCase().includes(keyword.toLowerCase());
        const reviewerNameMatch = review.user?.name?.toLowerCase().includes(keyword.toLowerCase());
        const commentMatch = review.comment?.toLowerCase().includes(keyword.toLowerCase());
        return productTitleMatch || reviewerNameMatch || commentMatch;
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  useEffect(() => {
    filter();
  }, [filterItem, reviews]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleVisibility = (reviewId, currentVisible) => {
    setIsloading(true);
    api
      .toggleReviewVisibility(reviewId, !currentVisible)
      .then((result) => {
        if (result.success) {
          setError("Review visibility updated successfully");
          setAlertType("success");
          fetchReviews();
        } else {
          setError(result.message);
          setAlertType("error");
          setIsloading(false);
        }
      })
      .catch((err) => {
        setError(err.message);
        setAlertType("error");
        setIsloading(false);
      });
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to permanently delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIsloading(true);
            api
              .deleteReview(reviewId)
              .then((result) => {
                if (result.success) {
                  setError("Review deleted successfully");
                  setAlertType("success");
                  fetchReviews();
                } else {
                  setError(result.message);
                  setAlertType("error");
                  setIsloading(false);
                }
              })
              .catch((err) => {
                setError(err.message);
                setAlertType("error");
                setIsloading(false);
              });
          },
        },
      ]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={colors.warning}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // Calculate stats for the overview cards
  const totalReviewsCount = reviews.length;
  const hiddenReviewsCount = reviews.filter((r) => !r.visible).length;
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

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
        <TouchableOpacity disabled testID="view-reviews-icon-btn">
          <Ionicons name="star" size={25} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">View Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">Moderate customer ratings and reviews</Text>
        </View>
      </View>

      {/* Overview Cards Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{totalReviewsCount}</Text>
          <Text style={styles.statLbl}>Total Reviews</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{hiddenReviewsCount}</Text>
          <Text style={styles.statLbl}>Hidden</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{averageRating} ★</Text>
          <Text style={styles.statLbl}>Avg Rating</Text>
        </View>
      </View>

      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <CustomInput
        radius={5}
        placeholder={"Search product, reviewer, comment..."}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems && foundItems.length == 0 ? (
          <Text style={styles.emptyText} testID="view-reviews-empty-text">No reviews found!</Text>
        ) : (
          foundItems.map((item, index) => (
            <View
              key={item._id || index}
              style={[styles.reviewCard, !item.visible && styles.reviewCardHidden]}
              testID={`view-reviews-item-${index}`}
            >
              <View style={styles.reviewHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {item.productTitle || "Unknown Product"}
                  </Text>
                  <Text style={styles.reviewerName}>By: {item.user?.name || "Anonymous"}</Text>
                </View>
                {renderStars(item.rating)}
              </View>

              {item.comment ? (
                <Text style={styles.reviewComment}>{item.comment}</Text>
              ) : (
                <Text style={[styles.reviewComment, { fontStyle: "italic", color: colors.muted }]}>
                  No written comment.
                </Text>
              )}

              <View style={styles.reviewFooter}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified Purchase</Text>
                    </View>
                  )}
                  {!item.visible && (
                    <View style={styles.hiddenBadge}>
                      <Text style={styles.hiddenText}>Hidden</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleVisibility(item._id, item.visible)}
                    testID={`view-reviews-toggle-btn-${index}`}
                  >
                    <Ionicons
                      name={item.visible ? "eye" : "eye-off"}
                      size={20}
                      color={item.visible ? colors.muted : colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteReview(item._id)}
                    testID={`view-reviews-delete-btn-${index}`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ViewReviewsScreen;

const styles = StyleSheet.create({
  container: {
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statVal: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
  },
  statLbl: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: colors.muted,
  },
  reviewCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginVertical: 6,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewCardHidden: {
    backgroundColor: "#F2F2F2",
    opacity: 0.8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    paddingBottom: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewerName: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 13,
    color: colors.dark,
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 8,
  },
  verifiedBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
  },
  verifiedText: {
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "bold",
  },
  hiddenBadge: {
    backgroundColor: "#FFEBEB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  hiddenText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
});
