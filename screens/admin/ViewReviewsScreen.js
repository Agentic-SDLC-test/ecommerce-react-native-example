import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput";
import ReviewListItem from "../../components/ReviewListItem";

const FILTER_OPTIONS = ["all", "visible", "hidden", "removed"];

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [filterItem, setFilterItem] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const fetchReviews = async (selectedVisibility = visibilityFilter) => {
    setIsloading(true);
    try {
      const result = await api.getAdminReviews(
        selectedVisibility === "all"
          ? {}
          : { visibility: selectedVisibility }
      );

      if (result.success) {
        setReviews(result.data || []);
        setError("");
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (reviewError) {
      setAlertType("error");
      setError(reviewError.message);
    } finally {
      setIsloading(false);
    }
  };

  const handleOnRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const filteredReviews = useMemo(() => {
    const needle = filterItem.trim().toLowerCase();
    if (!needle) return reviews;

    return reviews.filter((review) => {
      return [
        review.productTitle,
        review.displayName,
        review.userEmail,
        review.comment,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [filterItem, reviews]);

  const handleVisibility = async (reviewId, nextVisibility) => {
    setIsloading(true);
    try {
      const result = await api.updateReviewVisibility(reviewId, nextVisibility);
      if (result.success) {
        setAlertType("success");
        setError(result.message);
        await fetchReviews();
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (reviewError) {
      setAlertType("error");
      setError(reviewError.message);
    } finally {
      setIsloading(false);
    }
  };

  const handleRemove = async (reviewId) => {
    setIsloading(true);
    try {
      const result = await api.removeReview(reviewId);
      if (result.success) {
        setAlertType("success");
        setError(result.message);
        await fetchReviews();
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (reviewError) {
      setAlertType("error");
      setError(reviewError.message);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    fetchReviews(visibilityFilter);
  }, [visibilityFilter]);

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={"Loading..."} />
      <StatusBar testID="view-reviews-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
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
          View Reviews
        </Text>
        <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
          Moderate verified purchaser reviews
        </Text>
      </View>

      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <CustomInput
        radius={5}
        placeholder={"Search reviews..."}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setVisibilityFilter(option)}
            style={[
              styles.filterChip,
              visibilityFilter === option && styles.filterChipActive,
            ]}
            testID={`view-reviews-filter-${option}`}
          >
            <Text
              style={[
                styles.filterChipText,
                visibilityFilter === option && styles.filterChipTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {filteredReviews.length === 0 ? (
          <Text testID="view-reviews-empty-text" style={styles.emptyText}>
            No reviews found for the current filter.
          </Text>
        ) : (
          filteredReviews.map((review, index) => (
            <ReviewListItem
              key={review._id}
              review={review}
              mode="admin"
              onHide={() => handleVisibility(review._id, "hidden")}
              onShow={() => handleVisibility(review._id, "visible")}
              onRemove={() => handleRemove(review._id)}
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
  filterRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.muted,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: colors.white,
  },
  emptyText: {
    color: colors.muted,
    marginTop: 20,
  },
});
