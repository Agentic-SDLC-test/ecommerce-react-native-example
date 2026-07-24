import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput";

const ViewReviewsScreen = ({ navigation, route }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  const handleReviewDetail = (review) => {
    navigation.navigate("viewreviewdetails", {
      reviewDetail: review,
      authUser: route.params?.authUser,
    });
  };

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
        }
        setIsloading(false);
      })
      .catch((fetchError) => {
        setIsloading(false);
        setError(fetchError.message);
      });
  };

  const filterReviews = () => {
    const keyword = filterItem.trim().toLowerCase();
    if (!keyword) {
      setFoundItems(reviews);
      return;
    }

    const results = reviews.filter((item) =>
      [
        item?.productTitle,
        item?.userName,
        item?.orderId,
        item?.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
    setFoundItems(results);
  };

  useEffect(() => {
    filterReviews();
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
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText} testID="view-reviews-heading">
          View Reviews
        </Text>
        <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
          Moderate shopper reviews
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <CustomInput
        radius={5}
        placeholder={"Search by product, reviewer, order, or status"}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems.length === 0 ? (
          <Text testID="view-reviews-empty-text">
            No reviews found for "{filterItem}".
          </Text>
        ) : (
          foundItems.map((review, index) => (
            <TouchableOpacity
              key={review._id}
              style={styles.reviewCard}
              onPress={() => handleReviewDetail(review)}
              testID={`view-reviews-item-${index}`}
            >
              <View style={styles.reviewRow}>
                <Text style={styles.reviewTitle}>{review.productTitle}</Text>
                <Text style={styles.reviewStatus}>{review.status}</Text>
              </View>
              <Text style={styles.reviewMeta}>{review.userName}</Text>
              <Text style={styles.reviewMeta}>Order # {review.orderId}</Text>
              <Text numberOfLines={2} style={styles.reviewComment}>
                {review.comment}
              </Text>
            </TouchableOpacity>
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
  reviewCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  reviewRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewTitle: {
    flex: 1,
    fontWeight: "800",
    color: colors.dark,
    marginRight: 10,
  },
  reviewStatus: {
    color: colors.primary_shadow,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  reviewMeta: {
    marginTop: 4,
    color: colors.muted,
  },
  reviewComment: {
    marginTop: 8,
    color: colors.dark,
  },
});
