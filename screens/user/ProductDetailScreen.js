import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
  Modal,
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
import { formatReviewerName } from "../../utils/reviewHelper";

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

  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0.0);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [isEligible, setIsEligible] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review submission state
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  // method to fetch product reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);
    api
      .getProductReviews(product?._id)
      .then((result) => {
        if (result.success) {
          setReviewsList(result.reviews || []);
          setAverageRating(result.averageRating ?? 0.0);
          setTotalCount(result.totalCount ?? 0);
          setRatingDistribution(
            result.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          );
          setIsEligible(result.isEligible ?? false);
          setHasReviewed(result.hasReviewed ?? false);
          setMyReview(result.myReview ?? null);
        }
      })
      .catch((err) => {
        console.log("error fetching reviews", err);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  };

  // method to open the review modal for a new review or to edit the existing one
  const openReviewModal = (edit) => {
    if (edit && myReview) {
      setEditMode(true);
      setUserRating(myReview.rating ?? 0);
      setUserComment(myReview.comment ?? "");
    } else {
      setEditMode(false);
      setUserRating(0);
      setUserComment("");
    }
    setSubmitError("");
    setShowReviewModal(true);
  };

  // method to submit a review (create) or update the existing one (edit)
  const handleSubmitReview = async () => {
    if (userRating < 1 || userRating > 5) {
      setSubmitError("Please select a star rating (1 to 5 stars)");
      return;
    }
    setSubmitError("");
    setSubmittingReview(true);
    const request = editMode
      ? api.updateReview(myReview._id, {
          rating: userRating,
          comment: userComment,
        })
      : api.submitReview({
          productId: product?._id,
          rating: userRating,
          comment: userComment,
        });
    request
      .then((result) => {
        if (result.success) {
          setError(
            editMode
              ? "Review updated successfully"
              : "Review submitted successfully"
          );
          setAlertType("success");
          setShowReviewModal(false);
          setEditMode(false);
          setUserRating(0);
          setUserComment("");
          fetchReviews(); // reload reviews
        } else {
          setSubmitError(result.message || "Failed to submit review");
        }
      })
      .catch((err) => {
        setSubmitError(err.message || "Something went wrong. Please try again.");
      })
      .finally(() => {
        setSubmittingReview(false);
      });
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
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
        <View style={styles.productImageContainer}>
          <Image source={{ uri: productImage }} style={styles.productImage} testID="product-detail-image" />
        </View>
        <CustomAlert message={error} type={alertType} testID="product-detail-alert" />
        <View style={styles.productInfoContainer}>
          <ScrollView style={styles.productInfoTopContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.productNameContaier}>
              <Text style={styles.productNameText} testID="product-detail-title">{product?.title}</Text>
            </View>

            {/* Stars Row and Rating Summary */}
            <View style={styles.ratingSummaryContainer} testID="product-detail-rating-summary">
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(averageRating) ? "star" : "star-outline"}
                    size={18}
                    color={star <= Math.round(averageRating) ? "#ffc107" : colors.muted}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingText} testID="product-detail-rating-text">
                {totalCount > 0 ? `${averageRating} / 5 ★ (${totalCount} reviews)` : "No reviews yet"}
              </Text>
            </View>

            {/* Rating distribution (5★ → 1★), hidden when there are no reviews */}
            {totalCount > 0 ? (
              <View
                style={styles.distributionContainer}
                testID="product-detail-rating-distribution"
              >
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution?.[star] ?? 0;
                  const ratio = totalCount > 0 ? count / totalCount : 0;
                  return (
                    <View
                      key={star}
                      style={styles.distributionRow}
                      testID={`product-detail-rating-distribution-row-${star}`}
                    >
                      <Text style={styles.distributionLabel}>{star} ★</Text>
                      <View style={styles.distributionBarTrack}>
                        <View
                          style={[
                            styles.distributionBarFill,
                            { flex: ratio },
                          ]}
                        />
                        <View style={{ flex: 1 - ratio }} />
                      </View>
                      <Text style={styles.distributionCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

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

            {/* Write / Edit Review Button */}
            {isEligible && !hasReviewed ? (
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => openReviewModal(false)}
                testID="product-detail-write-review-btn"
              >
                <Text style={styles.writeReviewBtnText}>Write a Review</Text>
              </TouchableOpacity>
            ) : null}
            {isEligible && hasReviewed ? (
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => openReviewModal(true)}
                testID="product-detail-edit-review-btn"
              >
                <Text style={styles.writeReviewBtnText}>Edit Review</Text>
              </TouchableOpacity>
            ) : null}

            {/* Customer Reviews List */}
            <View style={styles.reviewsSectionContainer} testID="product-detail-reviews-section">
              <Text style={styles.reviewsSectionTitle} testID="product-detail-reviews-title">Customer Reviews</Text>
              
              {reviewsList.length === 0 ? (
                <Text style={styles.noReviewsText} testID="product-detail-no-reviews">
                  No reviews yet. Be the first to write one!
                </Text>
              ) : (
                reviewsList.slice(0, 5).map((rev) => (
                  <View key={rev._id} style={styles.reviewCard} testID={`product-detail-review-card-${rev._id}`}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewUser} testID="product-detail-review-username">
                        {formatReviewerName(rev.user?.name)}
                      </Text>
                      <Text style={styles.reviewDate} testID="product-detail-review-date">
                        {formatDate(rev.createdAt)}
                      </Text>
                    </View>
                    {rev.verified !== false ? (
                      <View
                        style={styles.verifiedBadge}
                        testID="product-detail-review-verified-badge"
                      >
                        <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                        <Text style={styles.verifiedBadgeText}>Verified Purchase</Text>
                      </View>
                    ) : null}
                    <View style={styles.reviewStarsRow} testID="product-detail-review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= rev.rating ? "star" : "star-outline"}
                          size={14}
                          color={star <= rev.rating ? "#ffc107" : colors.muted}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    {rev.comment ? (
                      <Text style={styles.reviewComment} testID="product-detail-review-comment">
                        {rev.comment}
                      </Text>
                    ) : null}
                  </View>
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

      {/* Review Submission Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
        testID="product-detail-review-modal"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle} testID="product-detail-review-modal-title">
              {editMode ? "Edit your review" : "Write a Review"}
            </Text>
            
            <View style={styles.interactiveStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                  testID={`review-modal-star-${star}`}
                >
                  <Ionicons
                    name={star <= userRating ? "star" : "star-outline"}
                    size={35}
                    color={star <= userRating ? "#ffc107" : colors.muted}
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write your review here (optional)..."
              value={userComment}
              onChangeText={(text) => {
                if (text.length <= 500) {
                  setUserComment(text);
                }
              }}
              multiline={true}
              numberOfLines={4}
              maxLength={500}
              testID="product-detail-review-modal-input"
            />
            <Text style={styles.charCounter} testID="product-detail-review-modal-char-counter">
              {userComment.length} / 500
            </Text>

            {submitError ? (
              <Text style={styles.modalErrorText} testID="product-detail-review-modal-error">
                {submitError}
              </Text>
            ) : null}

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowReviewModal(false);
                  setEditMode(false);
                  setUserRating(0);
                  setUserComment("");
                  setSubmitError("");
                }}
                disabled={submittingReview}
                testID="product-detail-review-modal-cancel"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
                testID="product-detail-review-modal-submit"
              >
                {submittingReview ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  ratingSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  starsRow: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "600",
  },
  distributionContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distributionLabel: {
    fontSize: 12,
    color: colors.muted,
    width: 30,
  },
  distributionBarTrack: {
    flex: 1,
    flexDirection: "row",
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  distributionBarFill: {
    backgroundColor: "#ffc107",
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: colors.muted,
    width: 24,
    textAlign: "right",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 3,
  },
  writeReviewBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  writeReviewBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  reviewsSectionContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
    paddingBottom: 40,
  },
  reviewsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.dark,
  },
  noReviewsText: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.muted,
  },
  reviewStarsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.dark,
  },
  interactiveStarsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  commentInput: {
    width: "100%",
    height: 120,
    borderColor: colors.muted,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.dark,
  },
  charCounter: {
    width: "100%",
    textAlign: "right",
    fontSize: 12,
    color: colors.muted,
    marginTop: 5,
    marginBottom: 15,
  },
  modalErrorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  cancelButtonText: {
    color: colors.muted,
    fontWeight: "bold",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
});
