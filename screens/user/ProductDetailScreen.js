import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import cartIcon from "../../assets/icons/cart_beg.png";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ReviewSummary from "../../components/ReviewSummary";
import ReviewList from "../../components/ReviewList";
import StarRating from "../../components/StarRating";
import { eligibilityMessage } from "../../utils/reviews";
import { ReviewEligibility } from "@agentic-sdlc-test/easybuy-api-client/domain";

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
  const [reviewData, setReviewData] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [eligibility, setEligibility] = useState(null);

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
    SetProductImage(api.imageUrl(product?.image));
    fetchWishlist();
  }, []);

  //render whenever the value of wishlistItems change
  useEffect(() => {}, [wishlistItems]);

  //method to fetch the rating summary and recent written reviews for this product
  const fetchReviews = () => {
    api
      .getProductReviews(product?._id, { limit: 5 })
      .then((result) => {
        if (result.success) {
          setReviewData(result.data);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  //method to fetch the caller's own review and eligibility for this product
  const fetchMyReview = () => {
    api
      .getMyReview(product?._id)
      .then((result) => {
        if (result.success) {
          setEligibility(result.data.eligibility);
          setMyReview(result.data.review);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  //refresh reviews and the caller's own review every time this screen regains focus
  useFocusEffect(
    useCallback(() => {
      fetchReviews();
      fetchMyReview();
    }, [product?._id])
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
          <ScrollView
            testID="product-detail-info-scroll"
            style={{ width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
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
            <View style={styles.reviewsSectionContainer} testID="product-detail-reviews-section">
              <Text style={styles.reviewsHeading}>Ratings &amp; Reviews</Text>
              <ReviewSummary summary={reviewData?.summary} testID="product-detail-review-summary" />
              {reviewData?.reviews?.map((item, index) => (
                <ReviewList key={item._id} review={item} testID={`product-detail-review-${index}`} />
              ))}
              {reviewData?.summary?.count > 0 && reviewData?.writtenCount === 0 && (
                <Text style={styles.noWrittenReviewsText} testID="product-detail-no-written-reviews">
                  No written reviews yet.
                </Text>
              )}
              {reviewData?.writtenCount > 0 && (
                <TouchableOpacity
                  testID="product-detail-see-all-reviews-btn"
                  onPress={() => navigation.navigate("productreviews", { product })}
                >
                  <Text style={styles.seeAllReviewsText}>
                    See all reviews ({reviewData.writtenCount})
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.reviewCtaContainer} testID="product-detail-review-cta">
                {eligibility === ReviewEligibility.ELIGIBLE && !myReview && (
                  <CustomButton
                    testID="product-detail-write-review-btn"
                    text={"Write a review"}
                    onPress={() =>
                      navigation.navigate("writereview", {
                        productId: product?._id,
                        productTitle: product?.title,
                      })
                    }
                  />
                )}
                {eligibility === ReviewEligibility.ELIGIBLE && myReview && (
                  <View testID="product-detail-my-review">
                    <View style={styles.myRatingRow} testID="product-detail-my-rating">
                      <Text style={styles.myRatingLabel}>Your rating:</Text>
                      <StarRating rating={myReview.rating} size={16} />
                    </View>
                    {myReview.hidden && (
                      <Text style={styles.hiddenNoteText} testID="product-detail-hidden-note">
                        Hidden by the store
                      </Text>
                    )}
                    <CustomButton
                      testID="product-detail-edit-review-btn"
                      text={"Edit your review"}
                      onPress={() =>
                        navigation.navigate("writereview", {
                          productId: product?._id,
                          productTitle: product?.title,
                        })
                      }
                    />
                  </View>
                )}
                {eligibility === ReviewEligibility.NOT_DELIVERED && (
                  <Text style={styles.eligibilityMessageText} testID="product-detail-not-delivered-msg">
                    {eligibilityMessage(ReviewEligibility.NOT_DELIVERED)}
                  </Text>
                )}
                {eligibility === ReviewEligibility.NOT_PURCHASED && (
                  <Text style={styles.eligibilityMessageText} testID="product-detail-not-purchased-msg">
                    {eligibilityMessage(ReviewEligibility.NOT_PURCHASED)}
                  </Text>
                )}
              </View>
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
  reviewsSectionContainer: {
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  reviewsHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.dark,
    marginBottom: 10,
  },
  noWrittenReviewsText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 10,
  },
  seeAllReviewsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  reviewCtaContainer: {
    marginTop: 15,
  },
  myRatingRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  myRatingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.dark,
    marginRight: 8,
  },
  hiddenNoteText: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  eligibilityMessageText: {
    color: colors.muted,
    fontSize: 13,
  },
});
