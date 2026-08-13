import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import cartIcon from "../../assets/icons/cart_beg.png";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewSummary from "../../components/ReviewSummary";
import ReviewStars from "../../components/ReviewStars";
import ReviewListItem from "../../components/ReviewListItem";

const emptyReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  recentReviews: [],
  canReview: false,
  currentUserReview: null,
};

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  //method to add item to cart(redux)
  const handleAddToCat = (item) => {
    addCartItem(item);
  };

  const [onWishlist, setOnWishlist] = useState(false);
  const [avaiableQuantity, setAvaiableQuantity] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [productImage, SetProductImage] = useState(" ");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [error, setError] = useState("");
  const [isDisable, setIsDisbale] = useState(true);
  const [alertType, setAlertType] = useState("error");
  const [reviewSummary, setReviewSummary] = useState(emptyReviewSummary);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [currentUserReview, setCurrentUserReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchReviews = async () => {
    setReviewLoading(true);
    api
      .getProductReviews(product._id)
      .then((result) => {
        if (result.success) {
          setReviewSummary(result.data);
          setCanReview(result.data.canReview === true);
          setCurrentUserReview(result.data.currentUserReview || null);
          if (result.data.currentUserReview) {
            setReviewRating(result.data.currentUserReview.rating);
            setReviewComment(result.data.currentUserReview.comment || "");
          }
        }
        setReviewLoading(false);
      })
      .catch((err) => {
        console.log("error", err);
        setReviewLoading(false);
      });
  };

  const handleSelectRating = (nextRating) => {
    setReviewRating(nextRating);
  };

  const handleSubmitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      setAlertType("error");
      return;
    }
    setReviewLoading(true);
    api
      .upsertProductReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      })
      .then((result) => {
        if (result.success) {
          setError(result.message);
          setAlertType("success");
          fetchReviews();
        } else {
          setError(result.message);
          setAlertType("error");
          setReviewLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to save review");
        setAlertType("error");
        setReviewLoading(false);
      });
  };

  //method to fetch wishlist from server using API call
  const fetchWishlist = async () => {
    api
      .getWishlist()
      .then((result) => {
        if (result.success) {
          setWishlistItems(result.data[0].wishlist);
          setIsDisbale(false);

          //check if the current active product is already in wishlish or not
          result.data[0].wishlist.map((item) => {
            if (item?.productId?._id === product?._id) {
              setOnWishlist(true);
            }
          });

          setError("");
        }
      })
      .catch((error) => {
        setError(error.message);
        console.log("error", error);
      });
  };

  //method to increase the product quantity
  const handleIncreaseButton = (quantity) => {
    if (avaiableQuantity > quantity) {
      setQuantity(quantity + 1);
    }
  };

  //method to decrease the product quantity
  const handleDecreaseButton = (quantity) => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  //method to add or remove item from wishlist
  const handleWishlistBtn = async () => {
    setIsDisbale(true);

    if (onWishlist) {
      //API call to remove a item in wishlish
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
          setOnWishlist(!onWishlist);
        })
        .catch((error) => {
          setAlertType("error");
          console.log("error", error);
        });
      setIsDisbale(false);
    } else {
      //API call to add a item in wishlish
      api
        .addToWishlist(product?._id, 1)
        .then((result) => {
          console.log(result);
          if (result.success) {
            setError(result.message);
            setAlertType("success");
            setOnWishlist(true);
          } else {
            setError(result.message);
            setAlertType("error");
          }
          setOnWishlist(!onWishlist);
        })
        .catch((error) => {
          setAlertType("error");
          console.log("error", error);
        });
      setIsDisbale(false);
    }
  };

  //set quantity, avaiableQuantity, product image and fetch wishlist on initial render
  useEffect(() => {
    setQuantity(0);
    setAvaiableQuantity(product.quantity);
    SetProductImage(`${network.serverip}/uploads/${product?.image}`);
    fetchWishlist();
    fetchReviews();
  }, []);

  //render whenever the value of wishlistItems change
  useEffect(() => {}, [wishlistItems]);

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
            <View style={styles.cartItemCountContainer} testID="product-detail-cart-badge">
              <Text style={styles.cartItemCountText} testID="product-detail-cart-count">{cartproduct.length}</Text>
            </View>
          ) : (
            <></>
          )}
          <Image source={cartIcon} testID="product-detail-cart-icon" />
        </TouchableOpacity>
      </View>
      <View style={styles.bodyContainer}>
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          <View style={styles.productImageContainer}>
            <Image source={{ uri: productImage }} style={styles.productImage} testID="product-detail-image" />
          </View>
          <CustomAlert message={error} type={alertType} testID="product-detail-alert" />
          <View style={styles.productInfoTopContainer}>
            <View style={styles.productNameContaier}>
              <Text style={styles.productNameText} testID="product-detail-title">{product?.title}</Text>
            </View>
            <View style={styles.infoButtonContainer}>
              <View style={styles.wishlistButtonContainer}>
                <TouchableOpacity
                  testID="product-detail-wishlist-btn"
                  disabled={isDisable}
                  style={styles.iconContainer}
                  onPress={() => handleWishlistBtn()}
                >
                  {onWishlist == false ? (
                    <Ionicons name="heart" size={25} color={colors.muted} />
                  ) : (
                    <Ionicons name="heart" size={25} color={colors.danger} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.productDetailContainer}>
              <View style={styles.productSizeOptionContainer}></View>
              <View style={styles.productPriceContainer}>
                <Text style={styles.secondaryTextSm} testID="product-detail-price-label">Price:</Text>
                <Text style={styles.primaryTextSm} testID="product-detail-price">{product?.price}$</Text>
              </View>
            </View>
            <View style={styles.productDescriptionContainer}>
              <Text style={styles.secondaryTextSm} testID="product-detail-description-label">Description:</Text>
              <Text testID="product-detail-description">{product?.description}</Text>
            </View>

            <View style={styles.reviewsSection} testID="product-detail-reviews-section">
              <Text style={styles.reviewsHeading}>Customer Reviews</Text>
              {reviewLoading && !reviewSummary.totalReviews ? (
                <ActivityIndicator color={colors.primary} testID="product-detail-reviews-loading" />
              ) : (
                <>
                  <ReviewSummary summary={reviewSummary} testID="product-detail-review-summary" />
                  {reviewSummary.totalReviews === 0 ? (
                    <Text style={styles.emptyReviewsText} testID="product-detail-no-reviews">
                      No reviews yet. Verified purchasers can be the first to review this product.
                    </Text>
                  ) : (
                    reviewSummary.recentReviews?.map((review, index) => (
                      <ReviewListItem
                        key={review._id}
                        review={review}
                        testID={`product-detail-review-${index}`}
                      />
                    ))
                  )}
                  {canReview ? (
                    <View style={styles.reviewForm} testID="product-detail-review-form">
                      <Text style={styles.secondaryTextSm}>
                        {currentUserReview ? "Update Review" : "Write a Review"}
                      </Text>
                      <ReviewStars
                        rating={reviewRating}
                        onChange={handleSelectRating}
                        size={24}
                        testID="product-detail-review-stars"
                      />
                      <TextInput
                        style={styles.reviewInput}
                        placeholder="Share your experience (optional)"
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        multiline
                        maxLength={500}
                        testID="product-detail-review-comment"
                      />
                      <CustomButton
                        testID="product-detail-submit-review-btn"
                        text={currentUserReview ? "Update Review" : "Submit Review"}
                        onPress={handleSubmitReview}
                        disabled={reviewLoading}
                      />
                    </View>
                  ) : (
                    <Text style={styles.ineligibleText} testID="product-detail-ineligible">
                      Only verified purchasers can review this product.
                    </Text>
                  )}
                </>
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
                  <Text style={styles.counterButtonText} testID="product-detail-decrease-text">-</Text>
                </TouchableOpacity>
                <Text style={styles.counterCountText} testID="product-detail-quantity">{quantity}</Text>
                <TouchableOpacity
                  testID="product-detail-increase-btn"
                  style={styles.counterButtonContainer}
                  onPress={() => {
                    handleIncreaseButton(quantity);
                  }}
                >
                  <Text style={styles.counterButtonText} testID="product-detail-increase-text">+</Text>
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
                <CustomButton testID="product-detail-out-of-stock-btn" text={"Out of Stock"} disabled={true} />
              )}
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
  toBarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bodyContainer: {
    width: "100%",
    flexDirection: "column",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  scrollBody: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
    flexDirection: "column",
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
    height: "100%",
    width: "100%",
    flex: 1,
  },
  productInfoBottomContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: colors.light,
    width: "100%",
    height: 140,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  productButtonContainer: {
    padding: 20,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: colors.white,
    width: "100%",
    height: 100,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  productNameContaier: {
    padding: 5,
    paddingLeft: 20,
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
    padding: 5,
    paddingLeft: 20,
    paddingRight: 20,
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
  },
  secondaryTextSm: { fontSize: 15, fontWeight: "bold" },
  primaryTextSm: { color: colors.primary, fontSize: 15, fontWeight: "bold" },
  productDescriptionContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
  },
  reviewsSection: {
    width: "100%",
    marginTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  reviewsHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyReviewsText: {
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  ineligibleText: {
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: 20,
    marginTop: 8,
    fontStyle: "italic",
  },
  reviewForm: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    minHeight: 60,
    textAlignVertical: "top",
    backgroundColor: colors.white,
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
});
