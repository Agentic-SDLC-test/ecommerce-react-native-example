import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
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
import * as session from "../../utils/session";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewSummary from "../../components/ReviewSummary";
import ReviewCard from "../../components/ReviewCard";
import ReviewForm from "../../components/ReviewForm";
import {
  REVIEW_PAGE_SIZE,
  areReviewsEnabled,
  clampComment,
  isValidRating,
} from "../../utils/reviews";

//viewer context before the server has answered: read-only, no contribution
const defaultViewer = {
  isAuthenticated: false,
  hasPurchased: false,
  canReview: false,
  myReview: null,
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
  const [reviews, setReviews] = useState([]);
  const [aggregate, setAggregate] = useState({ average: null, count: 0 });
  const [viewer, setViewer] = useState(defaultViewer);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewsShown, setReviewsShown] = useState(REVIEW_PAGE_SIZE);

  //method to fetch the aggregate, visible reviews and viewer context for this
  //product; never awaited before the product body renders
  const fetchReviews = () => {
    setReviewsLoading(true);
    api
      .getProductReviews(product?._id)
      .then((result) => {
        if (result.success) {
          setReviews(result.data?.reviews ?? []);
          setAggregate({
            average: result.data?.average ?? null,
            count: result.data?.count ?? 0,
          });
          setViewer(result.data?.viewer ?? defaultViewer);
          setReviewsError("");
        } else {
          setReviewsError(result.message);
        }
        setReviewsLoading(false);
      })
      .catch((error) => {
        setReviewsLoading(false);
        setReviewsError("Could not load reviews.");
        console.log("reviews:fetch error", error);
      });
  };

  //the session seam is the authority for sign-in state, not route params
  const loadAuthUser = () => {
    session
      .getUser()
      .then(setAuthUser)
      .catch((error) => {
        console.log("reviews:fetch error", error);
      });
  };

  //method to submit or update the shopper's own review for this product
  const handleSubmitReview = () => {
    if (!isValidRating(rating)) {
      return;
    }
    setReviewBusy(true);
    api
      .submitReview(product?._id, rating, clampComment(comment))
      .then((result) => {
        if (result.success) {
          setAlertType("success");
          setError(result.message);
          fetchReviews();
        } else {
          //keep the typed comment so the shopper can retry without rewriting it
          setAlertType("error");
          setError(result.message);
        }
        setReviewBusy(false);
      })
      .catch((error) => {
        setReviewBusy(false);
        setAlertType("error");
        setError("Could not submit your review. Please try again.");
        console.log("reviews:submit error", error);
      });
  };

  //method to remove the shopper's own review
  const handleRemoveReview = () => {
    setReviewBusy(true);
    api
      .deleteReview(viewer?.myReview?._id)
      .then((result) => {
        if (result.success) {
          setAlertType("success");
          setError(result.message);
          setRating(0);
          setComment("");
          fetchReviews();
        } else {
          setAlertType("error");
          setError(result.message);
        }
        setReviewBusy(false);
      })
      .catch((error) => {
        setReviewBusy(false);
        setAlertType("error");
        setError("Could not remove your review. Please try again.");
        console.log("reviews:delete error", error);
      });
  };

  //method to reveal the next page of reviews
  const handleShowMoreReviews = () => {
    setReviewsShown(reviewsShown + REVIEW_PAGE_SIZE);
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
    loadAuthUser();
  }, []);

  //render whenever the value of wishlistItems change
  useEffect(() => {}, [wishlistItems]);

  //prefill the form so a returning author sees their existing review
  useEffect(() => {
    if (viewer?.myReview) {
      setRating(viewer.myReview.rating);
      setComment(viewer.myReview.comment ?? "");
    }
  }, [viewer]);

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
        <View style={styles.productImageContainer}>
          <Image source={{ uri: productImage }} style={styles.productImage} testID="product-detail-image" />
        </View>
        <CustomAlert message={error} type={alertType} testID="product-detail-alert" />
        <View style={styles.productInfoContainer}>
          <View style={styles.productInfoTopContainer}>
            <ScrollView
              testID="product-detail-scroll"
              style={styles.productInfoScroll}
              showsVerticalScrollIndicator={false}
            >
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
              <View style={styles.productSizeOptionContainer}>
                {/* <Text style={styles.secondaryTextSm}>Size:</Text> */}
              </View>
              <View style={styles.productPriceContainer}>
                <Text style={styles.secondaryTextSm} testID="product-detail-price-label">Price:</Text>
                <Text style={styles.primaryTextSm} testID="product-detail-price">{product?.price}$</Text>
              </View>
            </View>
            <View style={styles.productDescriptionContainer}>
              <Text style={styles.secondaryTextSm} testID="product-detail-description-label">Description:</Text>
              <Text testID="product-detail-description">{product?.description}</Text>
            </View>
            {areReviewsEnabled() ? (
              <View style={styles.reviewsContainer} testID="product-detail-reviews-section">
                <Text style={styles.secondaryTextSm} testID="product-detail-reviews-label">Reviews:</Text>
                <ReviewSummary
                  average={aggregate.average}
                  count={aggregate.count}
                  testID="product-detail-reviews-summary"
                />
                {reviewsLoading && reviews.length === 0 ? (
                  <Text style={styles.reviewsMutedText} testID="product-detail-reviews-loading">
                    Loading reviews...
                  </Text>
                ) : (
                  <></>
                )}
                {reviewsError !== "" ? (
                  <View style={styles.reviewsErrorContainer}>
                    <Text style={styles.reviewsMutedText} testID="product-detail-reviews-error">
                      {reviewsError}
                    </Text>
                    <TouchableOpacity
                      onPress={() => fetchReviews()}
                      testID="product-detail-reviews-retry-btn"
                    >
                      <Text style={styles.reviewsLinkText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <></>
                )}
                {reviews.slice(0, reviewsShown).map((review, index) => (
                  <ReviewCard
                    key={review?._id ?? index}
                    item={review}
                    testID={`product-detail-review-item-${index}`}
                  />
                ))}
                {reviews.length > reviewsShown ? (
                  <TouchableOpacity
                    onPress={handleShowMoreReviews}
                    testID="product-detail-reviews-show-more-btn"
                  >
                    <Text style={styles.reviewsLinkText}>Show more reviews</Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
                {/* the contribution area waits for the server's viewer answer so
                    a purchaser never sees a sign-in prompt while it loads */}
                {reviewsLoading ? (
                  <></>
                ) : viewer?.canReview ? (
                  <ReviewForm
                    mode={viewer?.myReview ? "edit" : "create"}
                    rating={rating}
                    setRating={setRating}
                    comment={comment}
                    setComment={setComment}
                    onSubmit={handleSubmitReview}
                    onDelete={handleRemoveReview}
                    isBusy={reviewBusy}
                    hiddenNotice={viewer?.myReview?.isVisible === false}
                    testID="product-detail-review-form"
                  />
                ) : viewer?.isAuthenticated || authUser ? (
                  <Text style={styles.reviewsMutedText} testID="product-detail-reviews-gate-text">
                    Only verified purchasers can review this product.
                  </Text>
                ) : (
                  <CustomButton
                    text={"Sign in to review"}
                    onPress={() => navigation.navigate("login")}
                    testID="product-detail-reviews-signin-btn"
                  />
                )}
              </View>
            ) : (
              <></>
            )}
            </ScrollView>
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
  productInfoScroll: {
    width: "100%",
    flex: 1,
  },
  reviewsContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  reviewsErrorContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  reviewsMutedText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 10,
  },
  reviewsLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 10,
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
