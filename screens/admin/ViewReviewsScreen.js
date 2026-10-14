import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewList from "../../components/ReviewList";
import { confirmAction } from "../../utils/confirm";

const PAGE_LIMIT = 20;
const FILTERS = ["all", "visible", "hidden"];

const ViewReviewsScreen = ({ navigation }) => {
  const [filter, setFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [error, setError] = useState("");

  //method to fetch a page of reviews for the active visibility filter
  const fetchPage = (skip, activeFilter) => {
    setIsloading(true);
    api
      .getAdminReviews({ visibility: activeFilter, limit: PAGE_LIMIT, skip })
      .then((result) => {
        if (result.success) {
          setTotal(result.data.total);
          setReviews((previous) =>
            skip === 0 ? result.data.reviews : [...previous, ...result.data.reviews]
          );
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

  //method called when the active filter chip changes
  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    fetchPage(0, nextFilter);
  };

  //method called on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchPage(0, filter);
    setRefreshing(false);
  };

  //method called when the list is scrolled to the bottom
  const handleEndReached = () => {
    if (reviews.length < total && !isloading) {
      fetchPage(reviews.length, filter);
    }
  };

  //method to hide or unhide a review
  const handleToggle = (review) => {
    api
      .setReviewVisibility(review._id, !review.hidden)
      .then((result) => {
        if (result.success) {
          setReviews((previous) => {
            if (filter !== "all" && result.data.hidden !== (filter === "hidden")) {
              setTotal((t) => t - 1);
              return previous.filter((r) => r._id !== review._id);
            }
            return previous.map((r) => (r._id === review._id ? result.data : r));
          });
          setAlertType("success");
          setError(result.message);
        } else {
          setAlertType("error");
          setError(result.message);
        }
      })
      .catch((error) => {
        setAlertType("error");
        setError(error.message);
        console.log("error", error);
      });
  };

  //method to permanently remove a review, after confirming
  const handleRemove = async (review) => {
    const confirmed = await confirmAction({
      title: "Remove review",
      message: "This permanently deletes the review. It cannot be restored.",
    });
    if (!confirmed) return;

    api
      .deleteReview(review._id)
      .then((result) => {
        if (result.success) {
          setReviews((previous) => previous.filter((r) => r._id !== review._id));
          setTotal((t) => t - 1);
          setAlertType("success");
          setError(result.message);
        } else {
          setAlertType("error");
          setError(result.message);
        }
      })
      .catch((error) => {
        setAlertType("error");
        setError(error.message);
        console.log("error", error);
      });
  };

  //fetch the first page on initial render
  useEffect(() => {
    fetchPage(0, "all");
  }, []);

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading && reviews.length === 0} label={"Loading..."} />
      <StatusBar testID="view-reviews-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
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
        <Text style={styles.screenNameText} testID="view-reviews-heading">Reviews</Text>
        <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
          Hide, unhide or remove customer reviews
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <View style={styles.filterRow}>
        {FILTERS.map((item) => (
          <TouchableOpacity
            key={item}
            testID={`view-reviews-filter-${item}`}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
            onPress={() => handleFilterChange(item)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === item && styles.filterChipTextActive,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {reviews.length === 0 && !isloading ? (
        <Text style={styles.emptyText} testID="view-reviews-empty">No reviews to show.</Text>
      ) : (
        <FlatList
          testID="view-reviews-list"
          style={{ width: "100%", flex: 1 }}
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <ReviewList
              review={item}
              showProduct
              showStatus
              testID={`view-reviews-item-${index}`}
              actions={
                <>
                  <TouchableOpacity
                    testID={`view-reviews-toggle-btn-${index}`}
                    style={styles.actionButton}
                    onPress={() => handleToggle(item)}
                  >
                    <Text style={styles.actionButtonText}>
                      {item.hidden ? "Unhide" : "Hide"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID={`view-reviews-remove-btn-${index}`}
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemove(item)}
                  >
                    <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </>
              }
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={handleEndReached}
          refreshControl={
            <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default ViewReviewsScreen;

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
  filterRow: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: colors.white,
    marginRight: 8,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 20,
  },
  listContent: {
    width: "100%",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  removeButton: {
    backgroundColor: colors.danger,
  },
  removeButtonText: {
    color: colors.white,
  },
});
