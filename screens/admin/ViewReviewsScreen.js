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
import CustomButton from "../../components/CustomButton";
import ProgressDialog from "react-native-progress-dialog";
import ReviewCard from "../../components/ReviewCard";

function toCardReview(item) {
  return {
    rating: item.rating,
    comment: item.comment,
    reviewerName: item.user?.name || "Deleted customer",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    edited: new Date(item.updatedAt) - new Date(item.createdAt) > 1000,
  };
}

const ViewReviewsScreen = ({ navigation, route }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  //method the fetch all reviews (visible and hidden) from server using API call
  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews()
      .then((result) => {
        if (result.success) {
          setReviews(result.data);
          setFoundItems(result.data);
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

  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  //method to hide or restore a review
  const handleToggleVisibility = (review) => {
    api
      .updateReviewVisibility(review._id, !review.isVisible)
      .then((result) => {
        if (result.success) {
          fetchReviews();
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

  //method to permanently delete a review
  const handleDelete = (id) => {
    api
      .deleteReview(id)
      .then((result) => {
        if (result.success) {
          fetchReviews();
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

  //method for alert
  const showConfirmDialog = (id) => {
    return Alert.alert("Are you sure?", "This permanently removes the review.", [
      {
        text: "Yes",
        onPress: () => {
          handleDelete(id);
        },
      },
      {
        text: "No",
      },
    ]);
  };

  //method to filter the reviews by product title or reviewer name
  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews.filter((review) => {
        return (
          review.product?.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          review.user?.name?.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  //filter the data whenever filteritem value change
  useEffect(() => {
    filter();
  }, [filterItem]);

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
        <TouchableOpacity disabled testID="view-reviews-icon-btn">
          <AntDesign name="star" size={25} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText} testID="view-reviews-heading">
          View Reviews
        </Text>
        <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
          Moderate ratings and reviews
        </Text>
      </View>
      <CustomAlert testID="view-reviews-alert" message={error} type={alertType} />
      <CustomInput
        testID="view-reviews-search-input"
        radius={5}
        placeholder={"Search..."}
        value={filterItem}
        setValue={setFilterItem}
      />
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />}
      >
        {foundItems && foundItems.length === 0 ? (
          <Text testID="view-reviews-empty-text">{`No review found with the name of ${filterItem}!`}</Text>
        ) : (
          foundItems.map((item, index) => (
            <View key={item._id} style={styles.rowContainer}>
              <View style={styles.rowHeader}>
                <Text style={styles.productTitle} testID={`view-reviews-product-${index}`}>
                  {item.product?.title || "Deleted product"}
                </Text>
                <View
                  style={[styles.statusPill, item.isVisible ? styles.statusVisible : styles.statusHidden]}
                  testID={`view-reviews-status-${index}`}
                >
                  <Text style={styles.statusPillText}>{item.isVisible ? "Visible" : "Hidden"}</Text>
                </View>
              </View>
              <Text style={styles.reviewerLine} testID={`view-reviews-user-${index}`}>
                {`${item.user?.name || "Deleted customer"} (${item.user?.email || "-"})`}
              </Text>
              <ReviewCard review={toCardReview(item)} testID={`view-reviews-item-${index}`}>
                <View style={styles.actionsRow}>
                  <View style={styles.actionButtonWrapper}>
                    <CustomButton
                      testID={`view-reviews-toggle-${item._id}`}
                      text={item.isVisible ? "Hide" : "Restore"}
                      onPress={() => handleToggleVisibility(item)}
                    />
                  </View>
                  <View style={styles.actionButtonWrapper}>
                    <CustomButton
                      testID={`view-reviews-delete-${item._id}`}
                      text={"Delete"}
                      onPress={() => showConfirmDialog(item._id)}
                    />
                  </View>
                </View>
              </ReviewCard>
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
  rowContainer: {
    width: "100%",
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewerLine: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 5,
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusVisible: {
    backgroundColor: colors.success,
  },
  statusHidden: {
    backgroundColor: colors.danger,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButtonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
});
