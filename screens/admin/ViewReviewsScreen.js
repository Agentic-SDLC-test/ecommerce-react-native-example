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
import { ReviewModerationList } from "../../components/Reviews";

const ViewReviewsScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label] = useState("Loading...");
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
          setReviews(result.data);
          setFoundItems(result.data);
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
        const productTitle = review.product?.title?.toLowerCase() || "";
        const userName = review.user?.name?.toLowerCase() || "";
        const userEmail = review.user?.email?.toLowerCase() || "";
        const body = review.body?.toLowerCase() || "";
        const search = keyword.toLowerCase();
        return (
          productTitle.includes(search) ||
          userName.includes(search) ||
          userEmail.includes(search) ||
          body.includes(search)
        );
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  const handleToggleVisibility = (review) => {
    if (review.removed) return;
    const newVisible = !review.visible;
    api
      .setReviewVisibility(review._id, newVisible)
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

  const handleRemoveReview = (reviewId) => {
    Alert.alert(
      "Remove Review",
      "Are you sure you want to remove this review? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
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
    filter();
  }, [filterItem, reviews]);

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
        <TouchableOpacity disabled testID="view-reviews-icon-btn">
          <AntDesign name="star" size={25} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
            Moderate customer reviews
          </Text>
        </View>
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
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems && foundItems.length === 0 ? (
          <Text style={styles.emptyText} testID="view-reviews-empty-text">
            {filterItem
              ? `No reviews found matching "${filterItem}"`
              : "No reviews found"}
          </Text>
        ) : (
          foundItems.map((item, index) => (
            <ReviewModerationList
              key={item._id || index}
              item={item}
              onToggleVisibility={handleToggleVisibility}
              onRemove={handleRemoveReview}
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
    width: "100%",
    paddingLeft: 20,
    paddingBottom: 10,
  },
  screenNameText: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.primary,
  },
  screenNameParagraph: {
    fontSize: 14,
    color: colors.muted,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: colors.muted,
    fontSize: 14,
  },
});
