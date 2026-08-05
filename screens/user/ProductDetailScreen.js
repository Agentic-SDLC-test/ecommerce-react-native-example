import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import cartIcon from "../../assets/icons/cart_beg.png";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewList from "../../components/ReviewList/ReviewList";
import RatingBreakdown from "../../components/RatingBreakdown/RatingBreakdown";

const EMPTY_SUMMARY = {
  averageRating: 0,
  totalReviewCount: 0,
  ratingDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
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
  const [isDisable, setIsDisbale] = useState(true);
  const [alertType, setAlertType] = useState("error");
  const [reviewSummary, setReviewSummary] = useState(EMPTY_SUMMARY);
  const [recentReviews, setRecentReviews] = useState([]);
  const [viewer, setViewer] = useState({
    canSubmit: false,
    hasExistingReview: false,
    reviewId: null,
    eligibleOrderId: null,
    reason: "login_required",
    review: null,
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleAddToCat = (item) => {
    addCartItem(item);
  };

  const fetchWishlist = async () => {
    api
      .getWishlist()
      .then((result) => {
        if (result.success) {
          setIsDisbale(false);
          let foundOnWishlist = false;

          result.data[0].wishlist.forEach((item) => {
            if (item?.productId?._id === product?._id) {
              foundOnWishlist = true;
            }
          });

          setOnWishlist(foundOnWishlist);
          setError("");
        }
      })
      .catch((requestError) => {
        setError(requestError.message);
      });
  };

  const fetchProductReviews = () => {
    setReviewLoading(true);

    api
      .getProductReviews(product?._id)
      .then((result) => {
        if (result.success) {
          setReviewSummary(result.data?.summary || EMPTY_SUMMARY);
          setRecentReviews(result.data?.recentReviews || []);
          setViewer(
            result.data?.viewer || {
              canSubmit: false,
              hasExistingReview: false,
              reviewId: null,
              eligibleOrderId: null,
              reason: "login_required",
              review: null,
            }
          );
          return;
        }

        setAlertType("error");
        setError(result.message || "Unable to load reviews");
      })
      .catch((requestError) => {
        setAlertType("error");
        setError(requestError.message);
      })
      .finally(() => {
        setReviewLoading(false);
      });
  };

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
    setIsDisbale(true);

    if (onWishlist) {
      api
        .removeFromWishlist(product?._id)
        .then((result) => {
          if (result.success) {
            setError(result.message);
            setAlertType("success");
            setOnWishlist(false);
          } else {
            setError(result.message);
            setAlertType("error");
          }
        })
        .catch((requestError) => {
          setAlertType("error");
          setError(requestError.message);
        })
        .finally(() => {
          setIsDisbale(false);
        });
      return;
    }

    api
      .addToWishlist(product?._id, 1)
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
          setOnWishlist(true);
        } else {
          setError(result.message);
          setAlertType("error");
        }
      })
      .catch((requestError) => {
        setAlertType("error");
        setError(requestError.message);
      })
      .finally(() => {
        setIsDisbale(false);
      });
  };

  const handleReviewPress = () => {
    navigation.navigate("revieweditor", {
      product,
      existingReview: viewer?.review || null,
      reviewId: viewer?.reviewId || null,
      eligibleOrderId: viewer?.eligibleOrderId || null,
    });
  };

  const reviewActionLabel = viewer?.hasExistingReview ? "Edit Review" : "Write Review";
  const reviewDisabledMessage = useMemo(() => {
    if (viewer?.reason === "delivery_required") {
      return "Reviews unlock after this product is delivered.";
    }
    if (viewer?.reason === "login_required") {
      return "Sign in to write a review.";
    }
    return "";
  }, [viewer]);

  useEffect(() => {
    setQuantity(0);
    setAvaiableQuantity(product.quantity);
    setProductImage(`${network.serverip}/uploads/${product?.image}`);
    fetchWishlist();
    fetchProductReviews();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchProductReviews();
    });

    return unsubscribe;
  }, [navigation, product?._id]);
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

        <View></View>
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
      <View style={styles.bodyContainer}>
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
          <ScrollView
            style={styles.productInfoScroll}
            showsVerticalScrollIndicator={false}
            testID="product-detail-scroll"
          >
            <View style={styles.productNameContaier}>
              <Text style={styles.productNameText} testID="product-detail-title">
                {product?.title}
              </Text>
            </View>
            <View style={styles.infoButtonContainer}>
              <View style={styles.wishlistButtonContainer}>
                <TouchableOpacity
                  testID="product-detail-wishlist-btn"
                  disabled={isDisable}
                  style={styles.iconContainer}
                  onPress={() => handleWishlistBtn()}
                >
                  {onWishlist === false ? (
                    <Ionicons name="heart" size={25} color={colors.muted} />
                  ) : (
                    <Ionicons name="heart" size={25} color={colors.danger} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.productDetailContainer}>
              <View style={styles.productPriceContainer}>
                <Text
                  style={styles.secondaryTextSm}
                  testID="product-detail-price-label"
                >
                  Price:
                </Text>
                <Text style={styles.primaryTextSm} testID="product-detail-price">
                  {product?.price}$
                </Text>
              </View>
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
            <View style={styles.reviewSection} testID="product-detail-review-section">
              <Text style={styles.reviewHeading}>Ratings & Reviews</Text>
              <View style={styles.reviewSummaryCard}>
                <Text
                  style={styles.averageRating}
                  testID="product-detail-average-rating"
                >
                  {reviewSummary.averageRating.toFixed(1)}
                </Text>
                <Text
                  style={styles.reviewCountText}
                  testID="product-detail-review-count"
                >
                  {reviewSummary.totalReviewCount} visible review
                  {reviewSummary.totalReviewCount === 1 ? "" : "s"}
                </Text>
                <RatingBreakdown
                  ratingDistribution={reviewSummary.ratingDistribution}
                  totalReviewCount={reviewSummary.totalReviewCount}
                  testID="product-detail-rating-breakdown"
                />
              </View>
              <View style={styles.reviewActionContainer}>
                {viewer?.canSubmit || viewer?.hasExistingReview ? (
                  <CustomButton
                    text={reviewActionLabel}
                    onPress={handleReviewPress}
                    testID="product-detail-review-action-btn"
                  />
                ) : (
                  <CustomButton
                    text={"Write Review"}
                    disabled={true}
                    testID="product-detail-review-action-btn"
                  />
                )}
                {reviewDisabledMessage ? (
                  <Text
                    style={styles.reviewDisabledMessage}
                    testID="product-detail-review-disabled-message"
                  >
                    {reviewDisabledMessage}
                  </Text>
                ) : null}
              </View>
              {reviewLoading ? (
                <Text style={styles.reviewEmptyState}>Loading reviews...</Text>
              ) : recentReviews.length === 0 ? (
                <Text
                  style={styles.reviewEmptyState}
                  testID="product-detail-review-empty-text"
                >
                  No reviews yet
                </Text>
              ) : (
                recentReviews.map((review, index) => (
                  <ReviewList
                    key={review._id}
                    review={review}
                    testID={`product-detail-review-${index}`}
                  />
                ))
              )}
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
  },
  bodyContainer: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  productImageContainer: {
    width: "100%",
    flex: 2,
    backgroundColor: colors.light,
    flexDirecion: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
  },
  productInfoContainer: {
    width: "100%",
    flex: 3,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 25,
    overflow: "hidden",
  },
  productInfoScroll: {
    width: "100%",
    flex: 1,
  },
  productImage: {
    height: 300,
    width: 300,
    resizeMode: "contain",
  },
  productInfoBottomContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: colors.light,
    width: "100%",
    minHeight: 140,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  productButtonContainer: {
    padding: 20,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: colors.white,
    width: "100%",
    minHeight: 100,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  productNameContaier: {
    paddingTop: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  productNameText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoButtonContainer: {
    padding: 5,
    paddingRight: 0,
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  wishlistButtonContainer: {
    height: 50,
    width: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  productDetailContainer: {
    paddingHorizontal: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryTextSm: { fontSize: 15, fontWeight: "bold" },
  primaryTextSm: { color: colors.primary, fontSize: 15, fontWeight: "bold" },
  productDescriptionContainer: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  counterContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 50,
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
  reviewSection: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  reviewHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewSummaryCard: {
    width: "100%",
    backgroundColor: colors.light,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
  },
  reviewCountText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  reviewActionContainer: {
    marginTop: 12,
  },
  reviewDisabledMessage: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 12,
  },
  reviewEmptyState: {
    marginTop: 12,
    color: colors.muted,
    fontStyle: "italic",
  },
});
