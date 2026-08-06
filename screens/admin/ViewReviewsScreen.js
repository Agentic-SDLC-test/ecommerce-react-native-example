import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import ReviewCard from "../../components/ReviewCard";
import { areReviewsEnabled } from "../../utils/reviews";

const ViewReviewsScreen = ({ navigation, route }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState(route.params?.productFilter ?? "");
  const [busyId, setBusyId] = useState("");
  const reviewsEnabled = areReviewsEnabled();

  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  //method the fetch the review data from server using API call
  const fetchReviews = () => {
    if (!reviewsEnabled) return;
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
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        console.log("reviews:fetch error", error);
      });
  };

  //method to hide or unhide a single review
  const handleToggleVisibility = (item) => {
    setBusyId(item._id);
    api
      .setReviewVisibility(item._id, !item.isVisible)
      .then((result) => {
        if (result.success) {
          setAlertType("success");
          setError(result.message);
          setReviews(
            reviews.map((review) =>
              review._id === result.data._id ? result.data : review
            )
          );
        } else {
          setAlertType("error");
          setError(result.message);
        }
        setBusyId("");
      })
      .catch((error) => {
        setBusyId("");
        setAlertType("error");
        setError(error.message);
        console.log("reviews:visibility error", error);
      });
  };

  //method to filter the reviews by product title or reviewer name [search bar]
  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews?.filter((item) => {
        return (
          item?.product?.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.user?.name?.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  //filter the data whenever filteritem or the review list changes
  useEffect(() => {
    filter();
  }, [filterItem, reviews]);

  //fetch the reviews on initial render
  useEffect(() => {
    fetchReviews();
  }, []);

  //declared below every hook so hook order is identical on both branches; a
  //stale navigation state must never land on a live moderation console
  if (!reviewsEnabled) {
    return (
      <View style={styles.container} testID="view-reviews-screen">
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
        <Text testID="view-reviews-disabled-text">
          Reviews are turned off for this release.
        </Text>
      </View>
    );
  }

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
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">Moderate product reviews</Text>
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
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems && foundItems.length == 0 ? (
          <Text testID="view-reviews-empty-text">No reviews found.</Text>
        ) : (
          foundItems.map((review, index) => {
            return (
              <ReviewCard
                item={review}
                key={review?._id ?? index}
                productTitle={review?.product?.title}
                showVisibility
                onToggleVisibility={handleToggleVisibility}
                isBusy={busyId === review._id}
                testID={`view-reviews-item-${index}`}
              />
            );
          })
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
});
