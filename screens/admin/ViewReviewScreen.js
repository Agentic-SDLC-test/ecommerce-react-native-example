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
import DropDownPicker from "react-native-dropdown-picker";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { filterReviews } from "../../utils/reviews";

const STATUS_OPTIONS = [
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
  { label: "Removed", value: "removed" },
];

const ViewReviewScreen = ({ navigation }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [label, setLabel] = useState("Loading...");
  const [alertType, setAlertType] = useState("error");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [filterItem, setFilterItem] = useState("");
  const [openReviewId, setOpenReviewId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const fetchReviews = () => {
    setIsloading(true);
    api
      .getAdminReviews()
      .then((result) => {
        if (result.success) {
          setReviews(result.data);
          setSelectedStatuses(
            result.data.reduce((accumulator, review) => {
              accumulator[review._id] = review.moderationStatus;
              return accumulator;
            }, {})
          );
          setError("");
        } else {
          setError(result.message || "Unable to load reviews");
        }
      })
      .catch((requestError) => {
        setError(requestError.message);
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  const handleModerationUpdate = (reviewId, status) => {
    setIsloading(true);
    setError("");
    setAlertType("error");

    api
      .updateReviewVisibility(reviewId, status)
      .then((result) => {
        if (result.success) {
          setReviews((currentReviews) =>
            currentReviews.map((review) =>
              review._id === reviewId ? result.data : review
            )
          );
          setSelectedStatuses((currentState) => ({
            ...currentState,
            [reviewId]: result.data?.moderationStatus || status,
          }));
          setAlertType("success");
          setError(result.message);
          return;
        }

        setError(result.message || "Unable to update review visibility");
      })
      .catch((requestError) => {
        setError(requestError.message);
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  const foundItems = useMemo(
    () => filterReviews(reviews, filterItem),
    [filterItem, reviews]
  );

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-reviews-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
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
          Moderate shopper ratings and comments
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <CustomInput
        radius={5}
        placeholder={"Search by product, shopper email, or comment"}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />
      <ScrollView
        style={styles.bodyContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
        testID="view-reviews-scroll"
      >
        {foundItems.length === 0 ? (
          <Text style={styles.emptyText} testID="view-reviews-empty-text">
            No reviews found for {filterItem || "the current filters"}.
          </Text>
        ) : (
          foundItems.map((review, index) => (
            <View
              key={review._id}
              style={[
                styles.reviewCard,
                { zIndex: foundItems.length - index },
              ]}
              testID={`view-reviews-item-${index}`}
            >
              <Text
                style={styles.reviewTitle}
                testID={`view-reviews-item-${index}-product`}
              >
                {review?.product?.title}
              </Text>
              <Text style={styles.reviewMeta}>
                {review?.user?.name} • {review?.user?.email}
              </Text>
              <Text style={styles.reviewMeta}>
                Rating: {review?.rating} • Status: {review?.moderationStatus}
              </Text>
              <Text style={styles.reviewMeta}>
                Updated: {new Date(review?.updatedAt).toLocaleDateString("en-CA")}
              </Text>
              <Text
                style={styles.reviewComment}
                testID={`view-reviews-item-${index}-comment`}
              >
                {review?.comment}
              </Text>
              <View style={styles.moderationContainer}>
                <View style={styles.dropdownContainer}>
                  <DropDownPicker
                    open={openReviewId === review._id}
                    value={selectedStatuses[review._id] || review.moderationStatus}
                    items={STATUS_OPTIONS}
                    setOpen={(isOpen) =>
                      setOpenReviewId(isOpen ? review._id : null)
                    }
                    setValue={(callback) => {
                      const nextValue = callback(
                        selectedStatuses[review._id] || review.moderationStatus
                      );

                      setSelectedStatuses((currentState) => ({
                        ...currentState,
                        [review._id]: nextValue,
                      }));
                    }}
                    setItems={() => {}}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    testID={`view-reviews-item-${index}-dropdown`}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <CustomButton
                    text={"Update"}
                    onPress={() =>
                      handleModerationUpdate(
                        review._id,
                        selectedStatuses[review._id] || review.moderationStatus
                      )
                    }
                    testID={`view-reviews-item-${index}-update-btn`}
                  />
                </View>
              </View>
            </View>
          ))
        )}
        <View style={styles.emptyView}></View>
      </ScrollView>
    </View>
  );
};

export default ViewReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: "center",
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
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
  bodyContainer: {
    width: "100%",
    flex: 1,
    marginTop: 5,
  },
  emptyText: {
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 10,
  },
  reviewCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    elevation: 2,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewMeta: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 13,
  },
  reviewComment: {
    marginTop: 10,
    color: colors.dark,
    fontSize: 14,
    lineHeight: 18,
  },
  moderationContainer: {
    marginTop: 14,
  },
  dropdownContainer: {
    zIndex: 1000,
  },
  dropdown: {
    borderColor: colors.shadow,
  },
  dropdownList: {
    borderColor: colors.shadow,
  },
  buttonWrapper: {
    marginTop: 12,
  },
  emptyView: {
    height: 20,
  },
});
