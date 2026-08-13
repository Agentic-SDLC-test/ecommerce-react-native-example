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
import ReviewListItem from "../../components/ReviewListItem";

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews({ visibility: visibilityFilter })
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
        console.log("error", err);
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
        const productTitle = review.product?.title || "";
        const userName = review.user?.name || "";
        const comment = review.comment || "";
        const haystack = `${productTitle} ${userName} ${comment}`.toLowerCase();
        return haystack.includes(keyword.toLowerCase());
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  const handleToggleVisibility = (reviewId, visible) => {
    setIsloading(true);
    api
      .updateReviewVisibility(reviewId, visible)
      .then((result) => {
        if (result.success) {
          setError(result.message);
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

  const handleDelete = (reviewId) => {
    Alert.alert("Remove Review", "Are you sure you want to remove this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setIsloading(true);
          api
            .deleteReview(reviewId)
            .then((result) => {
              if (result.success) {
                setError(result.message);
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
    ]);
  };

  useEffect(() => {
    filter();
  }, [filterItem, reviews]);

  useEffect(() => {
    fetchReviews();
  }, [visibilityFilter]);

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-reviews-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="view-reviews-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity disabled testID="view-reviews-icon-btn">
          <AntDesign name="star" size={25} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">
            View Reviews
          </Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
            Moderate customer reviews
          </Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <View style={styles.filterRow}>
        {["all", "visible", "hidden"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterChip,
              visibilityFilter === option && styles.filterChipActive,
            ]}
            onPress={() => setVisibilityFilter(option)}
            testID={`view-reviews-filter-${option}`}
          >
            <Text
              style={[
                styles.filterChipText,
                visibilityFilter === option && styles.filterChipTextActive,
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CustomInput
        radius={5}
        placeholder={"Search..."}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />
      <ScrollView
        testID="view-reviews-list"
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems.map((review, index) => (
          <ReviewListItem
            key={review._id}
            review={review}
            admin
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDelete}
            testID={`view-reviews-item-${index}`}
          />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ViewReviewsScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  screenNameContainer: {
    padding: 20,
    paddingTop: 0,
    width: "100%",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    fontSize: 15,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.muted,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  listContainer: {
    width: "100%",
    paddingHorizontal: 20,
    flex: 1,
  },
});
