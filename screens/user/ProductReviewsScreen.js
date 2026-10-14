import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewSummary from "../../components/ReviewSummary";
import ReviewList from "../../components/ReviewList";

const PAGE_LIMIT = 20;

const ProductReviewsScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [writtenCount, setWrittenCount] = useState(0);
  const [isloading, setIsloading] = useState(false);
  const [refeshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [error, setError] = useState("");

  //method to fetch a page of written reviews for this product
  const fetchPage = (skip) => {
    setIsloading(true);
    api
      .getProductReviews(product?._id, { limit: PAGE_LIMIT, skip })
      .then((result) => {
        if (result.success) {
          setSummary(result.data.summary);
          setWrittenCount(result.data.writtenCount);
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

  //method called on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchPage(0);
    setRefreshing(false);
  };

  //method called when the list is scrolled to the bottom
  const handleEndReached = () => {
    if (reviews.length < writtenCount && !isloading) {
      fetchPage(reviews.length);
    }
  };

  //fetch the first page on initial render
  useEffect(() => {
    fetchPage(0);
  }, []);

  return (
    <View style={styles.container} testID="product-reviews-screen">
      <ProgressDialog visible={isloading && reviews.length === 0} label={"Loading..."} />
      <StatusBar testID="product-reviews-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="product-reviews-back-btn"
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
        <Text style={styles.screenNameText} testID="product-reviews-heading">Reviews</Text>
        <Text style={styles.screenNameParagraph} testID="product-reviews-subtitle">{product?.title}</Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="product-reviews-alert" />
      <FlatList
        testID="product-reviews-list"
        style={{ width: "100%", flex: 1 }}
        data={reviews}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.summaryWrapper}>
            <ReviewSummary summary={summary} testID="product-reviews-summary" />
            {summary?.count > 0 && writtenCount === 0 && (
              <Text style={styles.noWrittenReviewsText} testID="product-reviews-no-written">
                No written reviews yet.
              </Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <ReviewList review={item} testID={`product-reviews-item-${index}`} />
        )}
        onEndReachedThreshold={0.5}
        onEndReached={handleEndReached}
        refreshControl={
          <RefreshControl refreshing={refeshing} onRefresh={handleOnRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default ProductReviewsScreen;

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
  summaryWrapper: {
    width: "100%",
    marginBottom: 10,
  },
  noWrittenReviewsText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 10,
  },
  listContent: {
    width: "100%",
  },
});
