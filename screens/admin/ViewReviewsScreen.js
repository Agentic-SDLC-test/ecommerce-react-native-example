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
import ReviewList from "../../components/ReviewList/ReviewList";

const ViewReviewsScreen = ({ navigation }) => {
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
      .catch((err) => {
        setIsloading(false);
        setError(err.message);
        console.log("error", err);
      });
  };

  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews?.filter((item) => {
        return (
          item?.product?.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.user?.name?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.comment?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.moderationStatus?.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  useEffect(() => {
    filter();
  }, [filterItem]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleHide = (reviewId) => {
    setIsloading(true);
    api
      .hideReview(reviewId)
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
        setIsloading(false);
        setError(err.message);
        console.log("error", err);
      });
  };

  const handleToggleVisibility = (reviewId, nextVisible) => {
    setIsloading(true);
    api
      .toggleReviewVisibility(reviewId, nextVisible)
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
        setIsloading(false);
        setError(err.message);
        console.log("error", err);
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
            .removeReview(reviewId)
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
              setIsloading(false);
              setError(err.message);
              console.log("error", err);
            });
        },
      },
    ]);
  };

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-reviews-status-bar" />
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
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems && foundItems.length === 0 ? (
          <Text testID="view-reviews-empty-text">No reviews found!</Text>
        ) : (
          foundItems.map((review, index) => (
            <ReviewList
              item={review}
              key={review._id || index}
              onPressHide={handleHide}
              onPressToggleVisibility={handleToggleVisibility}
              onPressRemove={handleRemove}
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
