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
import ReviewList from "../../components/ReviewList";
import { resolveVisibility } from "../../utils/reviews";
import {
  REVIEW_VISIBILITIES,
  MODERATION_LABELS,
  REMOVE_CONFIRM_TEXT,
} from "../../constants/Reviews";

// The moderation surface. Hiding is reversible and removing is not, so removal
// goes through a confirmation that says so. No order or payment information
// appears here and nothing on this screen can write to an order.
const ViewReviewsScreen = ({ navigation, route }) => {
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  //method the fetch the review data from server using API call
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
        console.log("[reviews] load_failed", error?.message);
      });
  };

  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  //method to hide or restore a review — visibility only, never the order
  const handleVisibility = (review, visibility) => {
    setIsloading(true);
    api
      .setReviewVisibility(review?._id, visibility)
      .then((result) => {
        setIsloading(false);
        if (result.success) {
          setAlertType("success");
          setError(result.message);
          fetchReviews();
        } else {
          setAlertType("error");
          setError(result.message);
        }
      })
      .catch((error) => {
        setIsloading(false);
        setAlertType("error");
        setError(error.message);
        console.log("[reviews] moderate_failed", error?.message);
      });
  };

  //method to remove a review permanently, behind a confirmation
  const handleRemove = (review) => {
    Alert.alert(MODERATION_LABELS.remove, REMOVE_CONFIRM_TEXT, [
      { text: "Cancel", style: "cancel" },
      {
        text: MODERATION_LABELS.remove,
        style: "destructive",
        onPress: () => {
          setIsloading(true);
          api
            .deleteReview(review?._id)
            .then((result) => {
              setIsloading(false);
              if (result.success) {
                setAlertType("success");
                setError(result.message);
                fetchReviews();
              } else {
                setAlertType("error");
                setError(result.message);
              }
            })
            .catch((error) => {
              setIsloading(false);
              setAlertType("error");
              setError(error.message);
              console.log("[reviews] moderate_failed", error?.message);
            });
        },
      },
    ]);
  };

  //method to filter the reviews by reviewer name or review text [search bar]
  const filter = () => {
    const keyword = filterItem;
    if (keyword !== "") {
      const results = reviews?.filter((item) => {
        return (
          item?.reviewer_name?.toLowerCase().includes(keyword.toLowerCase()) ||
          item?.text?.toLowerCase().includes(keyword.toLowerCase())
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

  //method to convert data to dd-mm-yyyy format
  const dateFormat = (datex) => {
    let t = new Date(datex);
    const date = ("0" + t.getDate()).slice(-2);
    const month = ("0" + (t.getMonth() + 1)).slice(-2);
    const year = t.getFullYear();

    return `${date}-${month}-${year}`;
  };

  const moderationActions = (review, index) => {
    const hidden =
      resolveVisibility(review) === REVIEW_VISIBILITIES.HIDDEN;
    return (
      <View style={styles.actionsWrapper}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              handleVisibility(
                review,
                hidden
                  ? REVIEW_VISIBILITIES.VISIBLE
                  : REVIEW_VISIBILITIES.HIDDEN
              )
            }
            testID={`view-reviews-item-${index}-visibility-btn`}
          >
            <Text style={styles.actionText}>
              {hidden ? MODERATION_LABELS.restore : MODERATION_LABELS.hide}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemove(review)}
            testID={`view-reviews-item-${index}-remove-btn`}
          >
            <Text style={styles.removeText}>{MODERATION_LABELS.remove}</Text>
          </TouchableOpacity>
        </View>
        {review?.moderated_by && (
          <Text
            style={styles.moderationText}
            testID={`view-reviews-item-${index}-moderation`}
          >
            {`${review?.moderation_action} by ${review?.moderated_by} on ${dateFormat(
              review?.moderated_at
            )}`}
          </Text>
        )}
      </View>
    );
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
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-reviews-heading">View Reviews</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
            Hide, restore or remove customer reviews
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
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems && foundItems.length == 0 ? (
          <Text testID="view-reviews-empty-text">{`No review found for ${filterItem}!`}</Text>
        ) : (
          foundItems.map((review, index) => {
            return (
              <ReviewList
                item={review}
                key={index}
                showVisibility
                actions={moderationActions(review, index)}
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
  actionsWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
  },
  actionsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 5,
    borderColor: colors.muted,
    width: 90,
    marginRight: 10,
  },
  actionText: {
    fontSize: 13,
    color: colors.muted,
  },
  removeButton: {
    borderColor: colors.danger,
  },
  removeText: {
    fontSize: 13,
    color: colors.danger,
  },
  moderationText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 8,
  },
});
