import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import cartIcon from "../../assets/icons/cart_beg.png";
import { colors, network } from "../../constants";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import RatingStars from "../../components/Reviews/RatingStars";
import ReviewSummaryCard from "../../components/Reviews/ReviewSummaryCard";
import ReviewList from "../../components/Reviews/ReviewList";
import { isReviewsEnabled } from "../../utils/features";

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const reviewsEnabled = isReviewsEnabled();
  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  const [onWishlist, setOnWishlist] = useState(false);
  const [avaiableQuantity, setAvaiableQuantity] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [productImage, setProductImage] = useState(" ");
  const [error, setError] = useState("");
  const [isDisable, setIsDisbale] = useState(true);
  const [alertType, setAlertType] = useState("error");
  const [reviewContext, setReviewContext] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const viewer = reviewContext?.viewer;
  const canSubmitReview =
    reviewsEnabled &&
    !!viewer &&
    (viewer.canReview || viewer.canEdit) &&
    viewer.reason !== "REMOVED_BY_ADMIN";
  const reviewDisabled = !canSubmitReview || isSubmitting;

  const reviewComposerHeading = useMemo(() => {
    if (!viewer) {
      return "Write a review";
    }
    if (viewer.reason === "REMOVED_BY_ADMIN") {
      return "Review unavailable";
    }
    if (viewer.canEdit || viewer.reason === "REVIEW_EXISTS") {
      return "Edit your review";
    }
    return "Share your review";
  }, [viewer]);

  const setAlert = (message, type = "error") => {
    setError(message);
    setAlertType(type);
  };

  const handleAddToCat = (item) => {
    addCartItem(item);
  };

  const fetchWishlist = async () => {
    api
      .getWishlist()
      .then((result) => {
        if (result.success) {
          const wishlist = result.data[0].wishlist || [];
          setOnWishlist(
            wishlist.some((item) => item?.productId?._id === product?._id)
          );
        } else {
          setAlert(result.message, "error");
        }
      })
      .catch((fetchError) => {
        setAlert(fetchError.message, "error");
      })
      .finally(() => {
        setIsDisbale(false);
      });
  };

  const fetchReviewContext = async () => {
    if (!reviewsEnabled) {
      return;
    }

    api
      .getProductReviews(product?._id)
      .then((result) => {
        if (result.success) {
          setReviewContext(result.data);
        } else {
          setAlert(result.message, "error");
        }
      })
      .catch((fetchError) => {
        setAlert(fetchError.message, "error");
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
            setAlert(result.message, "success");
            setOnWishlist(false);
          } else {
            setAlert(result.message, "error");
          }
        })
        .catch((requestError) => {
          setAlert(requestError.message, "error");
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
          setAlert(result.message, "success");
          setOnWishlist(true);
        } else {
          setAlert(result.message, "error");
        }
      })
      .catch((requestError) => {
        setAlert(requestError.message, "error");
      })
      .finally(() => {
        setIsDisbale(false);
      });
  };

  const handleStartEdit = () => {
    if (!viewer?.review) {
      return;
    }
    setRating(viewer.review.rating);
    setComment(viewer.review.comment);
    setIsEditingReview(true);
  };

  const resetComposer = () => {
    setRating(0);
    setComment("");
    setIsEditingReview(false);
  };

  const handleSubmitReview = async () => {
    if (!canSubmitReview) {
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setAlert("Please choose a star rating between 1 and 5.", "error");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 10 || trimmedComment.length > 280) {
      setAlert("Review comments must be between 10 and 280 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const request = viewer?.canEdit
      ? api.updateReview(viewer.review._id, {
          rating,
          comment: trimmedComment,
        })
      : api.createReview({
          productId: product._id,
          orderId: viewer?.eligibleOrderId,
          rating,
          comment: trimmedComment,
        });

    request
      .then((result) => {
        if (result.success) {
          setAlert(
            viewer?.canEdit
              ? "Review updated successfully"
              : "Review submitted successfully",
            "success"
          );
          resetComposer();
          fetchReviewContext();
        } else {
          setAlert(result.message, "error");
        }
      })
      .catch((requestError) => {
        setAlert(requestError.message, "error");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    setQuantity(0);
    setAvaiableQuantity(product.quantity);
    setProductImage(`${network.serverip}/uploads/${product?.image}`);
    setIsDisbale(true);
    fetchWishlist();
    fetchReviewContext();
  }, [product?._id]);

  useEffect(() => {
    if (!viewer?.review) {
      return;
    }

    if (viewer.reason === "REMOVED_BY_ADMIN") {
      setRating(viewer.review.rating);
      setComment(viewer.review.comment);
      setIsEditingReview(false);
      return;
    }

    if (viewer.canEdit && !isEditingReview) {
      setRating(viewer.review.rating);
      setComment(viewer.review.comment);
    }
  }, [viewer?.review?._id, viewer?.canEdit, viewer?.reason, isEditingReview]);

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
          <View style={styles.productInfoTopContainer}>
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
                  {!onWishlist ? (
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
            {reviewsEnabled ? (
              <View
                style={styles.reviewSection}
                testID="product-detail-review-section"
              >
                <ReviewSummaryCard
                  summary={reviewContext?.summary}
                  testID="product-detail-review-summary"
                />
                <View style={styles.reviewComposerCard}>
                  <Text style={styles.reviewComposerTitle}>
                    {reviewComposerHeading}
                  </Text>
                  <RatingStars
                    value={rating}
                    onChange={setRating}
                    readonly={!canSubmitReview}
                    testID="product-detail-rating-input"
                  />
                  <CustomInput
                    value={comment}
                    setValue={setComment}
                    placeholder={"Write a short review (10-280 characters)"}
                    placeholderTextColor={colors.muted}
                    radius={10}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={280}
                    inputStyle={styles.reviewInput}
                    testID="product-detail-review-comment-input"
                  />
                  {viewer?.canEdit && viewer?.reason === "REVIEW_EXISTS" ? (
                    <TouchableOpacity
                      onPress={handleStartEdit}
                      testID="product-detail-review-edit-link"
                    >
                      <Text style={styles.editLink}>Edit your review</Text>
                    </TouchableOpacity>
                  ) : null}
                  <CustomButton
                    text={isEditingReview ? "Update review" : "Submit review"}
                    onPress={handleSubmitReview}
                    disabled={reviewDisabled}
                    testID="product-detail-review-submit-btn"
                  />
                </View>
                <ReviewList
                  reviews={reviewContext?.recentReviews || []}
                  viewer={reviewContext?.viewer}
                  testID="product-detail-review-list"
                />
              </View>
            ) : null}
          </View>
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
      </ScrollView>
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
    flex: 1,
  },
  bodyContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  productImageContainer: {
    width: "100%",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  productInfoContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: "flex-end",
    alignItems: "center",
    elevation: 25,
  },
  productImage: {
    height: 300,
    width: 300,
    resizeMode: "contain",
  },
  productInfoTopContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
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
    marginTop: 20,
  },
  productNameContaier: {
    width: "100%",
  },
  productNameText: {
    fontSize: 28,
    color: colors.dark,
    fontWeight: "800",
  },
  infoButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  wishlistButtonContainer: {
    backgroundColor: colors.white,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: colors.light,
  },
  productDetailContainer: {
    width: "100%",
    marginTop: 8,
  },
  productPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.muted,
    marginRight: 6,
  },
  primaryTextSm: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary_shadow,
  },
  productDescriptionContainer: {
    width: "100%",
    marginTop: 12,
  },
  reviewSection: {
    width: "100%",
    marginTop: 20,
  },
  reviewComposerCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 12,
  },
  reviewComposerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 10,
  },
  reviewInput: {
    minHeight: 110,
  },
  editLink: {
    color: colors.primary_shadow,
    fontWeight: "700",
    marginBottom: 10,
  },
  counterContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
  },
  counterButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  counterButtonText: {
    fontSize: 22,
    color: colors.primary_shadow,
    fontWeight: "800",
  },
  counterCountText: {
    fontSize: 18,
    color: colors.dark,
    fontWeight: "800",
    minWidth: 26,
    textAlign: "center",
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
  },
  cartIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  cartItemCountContainer: {
    position: "absolute",
    top: -8,
    right: -6,
    zIndex: 2,
    backgroundColor: colors.primary_shadow,
    borderRadius: 999,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartItemCountText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 12,
  },
});
