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

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  // fetch reviews from the server
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
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        console.log("error fetching admin reviews", error);
      });
  };

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  // filter reviews by product title or reviewer name or comment
  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews.filter((rev) => {
        return (
          (rev.productTitle && rev.productTitle.toLowerCase().includes(keyword.toLowerCase())) ||
          (rev.user?.name && rev.user.name.toLowerCase().includes(keyword.toLowerCase())) ||
          (rev.comment && rev.comment.toLowerCase().includes(keyword.toLowerCase()))
        );
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

  const handleToggleVisibility = async (reviewId, currentVisible) => {
    setIsloading(true);
    setLabel("Updating visibility...");
    api
      .updateReviewVisibility(reviewId, !currentVisible)
      .then((result) => {
        if (result.success) {
          setError("Visibility updated successfully");
          setAlertType("success");
          fetchReviews(); // reload reviews
        } else {
          setError(result.message || "Failed to update visibility");
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

  const handleDelete = (reviewId) => {
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
            setLabel("Deleting review...");
            api
              .deleteReview(reviewId)
              .then((result) => {
                if (result.success) {
                  setError("Review deleted successfully");
                  setAlertType("success");
                  fetchReviews(); // reload reviews
                } else {
                  setError(result.message || "Failed to delete review");
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
          <AntDesign name="star" size={25} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">Manage Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">Moderate customer reviews and ratings</Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <CustomInput
        radius={5}
        placeholder={"Search reviews..."}
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
        {foundItems && foundItems.length === 0 ? (
          <Text testID="view-reviews-empty-text" style={styles.emptyText}>
            {filterItem ? `No review found matching "${filterItem}"` : "No reviews submitted yet"}
          </Text>
        ) : (
          foundItems.map((item, index) => (
            <View
              key={item._id || index}
              style={styles.reviewCard}
              testID={`view-reviews-item-${index}`}
            >
              <View style={styles.reviewCardHeader}>
                <Text style={styles.productTitle} testID={`view-reviews-item-product-${index}`}>
                  {item.productTitle || "Unknown Product"}
                </Text>
                <Text style={styles.reviewDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>

              <View style={styles.reviewerRow}>
                <Text style={styles.reviewerName} testID={`view-reviews-item-username-${index}`}>
                  By: {item.user?.name || "Anonymous"}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"}
                      size={14}
                      color={star <= item.rating ? "#ffc107" : colors.muted}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              </View>

              {item.comment ? (
                <Text style={styles.commentText} testID={`view-reviews-item-comment-${index}`}>
                  "{item.comment}"
                </Text>
              ) : null}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.visible ? styles.hideButton : styles.showButton,
                  ]}
                  onPress={() => handleToggleVisibility(item._id, item.visible)}
                  testID={`view-reviews-item-toggle-btn-${index}`}
                >
                  <Text style={styles.actionButtonText}>
                    {item.visible ? "Hide Review" : "Show Review"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item._id)}
                  testID={`view-reviews-item-delete-btn-${index}`}
                >
                  <Text style={styles.actionButtonText}>Delete Review</Text>
                </TouchableOpacity>
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
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 15,
    color: colors.muted,
    fontStyle: "italic",
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: "100%",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    flex: 1,
    marginRight: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.muted,
  },
  reviewerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
  },
  starsContainer: {
    flexDirection: "row",
  },
  commentText: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.dark,
    backgroundColor: colors.light,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  hideButton: {
    backgroundColor: "#ffc107",
  },
  showButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
});
