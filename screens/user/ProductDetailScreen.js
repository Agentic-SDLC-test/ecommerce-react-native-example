import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import cartIcon from "../../assets/icons/cart_beg.png";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import RatingSummary from "../../components/RatingSummary";
import ReviewListItem from "../../components/ReviewListItem";

const EMPTY_SUMMARY = {
  averageRating: 0,
  totalVisibleReviews: 0,
  ratingDistribution: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
};

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  const [onWishlist, setOnWishlist] = useState(false);
  const [avaiableQuantity, setAvaiableQuantity] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [productImage, setProductImage] = useState(" ");
  const [error, setError] = useState("");
  const [isDisable, setIsDisable] = useState(true);
  const [alertType, setAlertType] = useState("error");
  const [reviewSummary, setReviewSummary] = useState(EMPTY_SUMMARY);
  const [recentReviews, setRecentReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [currentUserReview, setCurrentUserReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleAddToCat = (item) => {
    addCartItem(item);
    setAlertType("success");
    setError("Product added to cart");
  };

  const fetchWishlist = async () => {
    try {
      const result = await api.getWishlist();
      if (result.success) {
        const currentWishlist = result.data?.[0]?.wishlist || [];
        const exists = currentWishlist.some(
          (item) => item?.productId?._id === product?._id
        );
        setOnWishlist(exists);
        setIsDisable(false);
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (wishlistError) {
      setAlertType("error");
      setError(wishlistError.message);
    }
  };

  const fetchReviewBundle = useCallback(async () => {
    setReviewLoading(true);
    try {
      const result = await api.getProductReviewBundle(product?._id);
      if (result.success) {
        setReviewSummary(result.data?.summary || EMPTY_SUMMARY);
        setRecentReviews(result.data?.recentReviews || []);
        setEligibility(result.data?.eligibility || null);
        setCurrentUserReview(result.data?.currentUserReview || null);
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (reviewError) {
      setAlertType("error");
      setError(reviewError.message);
    } finally {
      setReviewLoading(false);
    }
  }, [product?._id]);

  const handleIncreaseButton = (currentQuantity) => {
    if (avaiableQuantity > currentQuantity) {
      setQuantity(currentQuantity + 1);
    }
  };

  const handleDecreaseButton = (currentQuantity) => {
    if (currentQuantity > 0) {
      setQuantity(currentQuantity - 1);
    }
  };

  const handleWishlistBtn = async () => {
    setIsDisable(true);
    try {
      const result = onWishlist
        ? await api.removeFromWishlist(product?._id)
        : await api.addToWishlist(product?._id, 1);

      if (result.success) {
        setAlertType("success");
        setError(result.message);
        setOnWishlist(!onWishlist);
      } else {
        setAlertType("error");
        setError(result.message);
      }
    } catch (wishlistError) {
      setAlertType("error");
      setError(wishlistError.message);
    } finally {
      setIsDisable(false);
    }
  };

  const canEditCurrentReview =
    currentUserReview && currentUserReview.visibility !== "removed";
  const canOpenReviewForm = canEditCurrentReview || eligibility?.canReview;
  const reviewActionText = canEditCurrentReview
    ? "Edit Your Review"
    : "Write a Review";
  const reviewHelperText =
    currentUserReview?.visibility === "removed"
      ? "This review was removed by an administrator."
      : eligibility?.canReview
      ? "Your review appears with a Verified Purchase badge."
      : eligibility?.reason || "Reviews unlock after delivery.";

  useEffect(() => {
    setQuantity(0);
    setAvaiableQuantity(product.quantity);
    setProductImage(`${network.serverip}/uploads/${product?.image}`);
    setError("");
    fetchWishlist();
  }, [product, fetchReviewBundle]);

  useFocusEffect(
    useCallback(() => {
      fetchReviewBundle();
    }, [fetchReviewBundle])
  );

  return (
    <View style={styles.container} testID="product-detail-screen">
      <StatusBar testID="product-detail-status-bar"></StatusBar>
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="product-detail-back-btn"
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

        <TouchableOpacity
          testID="product-detail-cart-btn"
          style={styles.cartIconContainer}
          onPress={() => navigation.navigate("cart")}
        >
          {cartproduct.length > 0 ? (
            <View
              style={styles.cartItemCountContainer}
              testID="product-detail-cart-badge"
            >
              <Text
                style={styles.cartItemCountText}
                testID="product-detail-cart-count"
              >
                {cartproduct.length}
              </Text>
            </View>
          ) : null}
          <Image source={cartIcon} testID="product-detail-cart-icon" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.bodyContainer}
        contentContainerStyle={styles.bodyContent}
        testID="product-detail-scroll"
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: productImage }}
            style={styles.productImage}
            testID="product-detail-image"
          />
        </View>
        <CustomAlert
          message={error}
          type={alertType}
          testID="product-detail-alert"
        />
        <View style={styles.productInfoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.productNameText} testID="product-detail-title">
              {product?.title}
            </Text>
            <TouchableOpacity
              testID="product-detail-wishlist-btn"
              disabled={isDisable}
              style={styles.iconContainer}
              onPress={handleWishlistBtn}
            >
              <Ionicons
                name="heart"
                size={25}
                color={onWishlist ? colors.danger : colors.muted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.productDetailContainer}>
            <Text style={styles.secondaryTextSm} testID="product-detail-price-label">
              Price:
            </Text>
            <Text style={styles.primaryTextSm} testID="product-detail-price">
              {product?.price}$
            </Text>
          </View>

          <View style={styles.productDescriptionContainer}>
            <Text
              style={styles.secondaryTextSm}
              testID="product-detail-description-label"
            >
              Description:
            </Text>
            <Text testID="product-detail-description">{product?.description}</Text>
          </View>

          <View style={styles.reviewSection}>
            <View style={styles.reviewHeadingRow}>
              <Text style={styles.sectionHeading}>Verified Reviews</Text>
              {reviewLoading ? (
                <Text style={styles.helperText}>Refreshing…</Text>
              ) : null}
            </View>

            <RatingSummary
              averageRating={reviewSummary.averageRating}
              totalVisibleReviews={reviewSummary.totalVisibleReviews}
              ratingDistribution={reviewSummary.ratingDistribution}
              testID="product-detail-rating-summary"
            />

            <Text style={styles.helperText} testID="product-detail-review-helper">
              {reviewHelperText}
            </Text>

            <CustomButton
              text={reviewActionText}
              onPress={() =>
                navigation.navigate("productreview", {
                  product,
                  currentUserReview,
                })
              }
              disabled={!canOpenReviewForm}
              testID="product-detail-review-cta"
            />

            {recentReviews.length === 0 ? (
              <Text
                style={styles.emptyReviewsText}
                testID="product-detail-no-reviews"
              >
                No verified reviews yet.
              </Text>
            ) : (
              recentReviews.map((review, index) => (
                <ReviewListItem
                  key={review._id}
                  review={review}
                  mode="shopper"
                  testID={`product-detail-review-${index}`}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.productInfoBottomContainer}>
        <View style={styles.counterContainer}>
          <View style={styles.counter}>
            <TouchableOpacity
              testID="product-detail-decrease-btn"
              style={styles.counterButtonContainer}
              onPress={() => {
                handleDecreaseButton(quantity);
              }}
            >
              <Text
                style={styles.counterButtonText}
                testID="product-detail-decrease-text"
              >
                -
              </Text>
            </TouchableOpacity>
            <Text
              style={styles.counterCountText}
              testID="product-detail-quantity"
            >
              {quantity}
            </Text>
            <TouchableOpacity
              testID="product-detail-increase-btn"
              style={styles.counterButtonContainer}
              onPress={() => {
                handleIncreaseButton(quantity);
              }}
            >
              <Text
                style={styles.counterButtonText}
                testID="product-detail-increase-text"
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.productButtonContainer}>
          {avaiableQuantity > 0 ? (
            <CustomButton
              testID="product-detail-add-to-cart-btn"
              text={"Add to Cart"}
              onPress={() => {
                handleAddToCat(product);
              }}
            />
          ) : (
            <CustomButton
              testID="product-detail-out-of-stock-btn"
              text={"Out of Stock"}
              disabled={true}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  bodyContainer: {
    width: "100%",
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  productImageContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  productInfoContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
    elevation: 10,
  },
  productImage: {
    height: 300,
    width: 300,
    resizeMode: "contain",
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  productNameText: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  productDetailContainer: {
    paddingTop: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryTextSm: { fontSize: 15, fontWeight: "bold" },
  primaryTextSm: { color: colors.primary, fontSize: 15, fontWeight: "bold" },
  productDescriptionContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 12,
  },
  reviewSection: {
    width: "100%",
    marginTop: 16,
  },
  reviewHeadingRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.muted,
  },
  helperText: {
    color: colors.muted,
    marginTop: 8,
  },
  emptyReviewsText: {
    color: colors.muted,
    marginTop: 10,
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    backgroundColor: colors.light,
    borderRadius: 20,
  },
  productInfoBottomContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: colors.light,
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  productButtonContainer: {
    padding: 20,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: colors.white,
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  counterContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 50,
    paddingBottom: 8,
  },
  counter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  counterButtonContainer: {
    display: "flex",
    width: 30,
    height: 30,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 15,
    elevation: 2,
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  counterCountText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cartIconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cartItemCountContainer: {
    position: "absolute",
    zIndex: 10,
    top: -10,
    left: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 22,
    width: 22,
    backgroundColor: colors.danger,
    borderRadius: 11,
  },
  cartItemCountText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 10,
  },
});
