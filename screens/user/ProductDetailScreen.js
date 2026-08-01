import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
  TextInput,
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
import * as session from "../../utils/session";

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

  // Reviews and Aggregates states
  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  });
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReviewId, setUserReviewId] = useState(null);

  // Form states
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Method to fetch reviews from API
  const fetchReviews = async () => {
    api
      .getProductReviews(product?._id)
      .then((result) => {
        if (result.success) {
          setReviewsList(result.data || []);
          setAverageRating(result.averageRating || 0);
          setTotalCount(result.totalCount || 0);
          setRatingDistribution(
            result.ratingDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
          );
          setCanReview(result.canReview || false);
          setHasReviewed(result.hasReviewed || false);
          setUserReviewId(result.userReviewId || null);
        }
      })
      .catch((err) => {
        console.log("Error fetching reviews", err);
      });
  };

  // Method to handle inline admin toggle visibility
  const handleToggleVisibility = (reviewId) => {
    api
      .toggleProductReviewVisibility(reviewId)
      .then((res) => {
        if (res.success) {
          setError(res.message);
          setAlertType("success");
          fetchReviews();
        } else {
          setError(res.message);
          setAlertType("error");
        }
      })
      .catch((err) => {
        setError(err.message);
        setAlertType("error");
      });
  };

  // Method to handle review deletion (Author or Admin)
  const handleDeleteReview = (reviewId) => {
    api
      .deleteProductReview(reviewId)
      .then((res) => {
        if (res.success) {
          setError(res.message);
          setAlertType("success");
          if (reviewId === userReviewId) {
            setFormRating(0);
            setFormComment("");
            setIsEditing(false);
          }
          fetchReviews();
        } else {
          setError(res.message);
          setAlertType("error");
        }
      })
      .catch((err) => {
        setError(err.message);
        setAlertType("error");
      });
  };

  // Method to handle submission of a review (creation or edit)
  const handleSubmitReview = () => {
    if (formRating < 1 || formRating > 5) {
      setError("Please select a rating of 1 to 5 stars.");
      setAlertType("error");
      return;
    }

    if (formComment.length > 500) {
      setError("Comment cannot exceed 500 characters.");
      setAlertType("error");
      return;
    }

    const payload = {
      productId: product?._id,
      rating: formRating,
      comment: formComment,
    };

    if (isEditing && userReviewId) {
      api
        .updateProductReview(userReviewId, { rating: formRating, comment: formComment })
        .then((res) => {
          if (res.success) {
            setError(res.message);
            setAlertType("success");
            setIsEditing(false);
            fetchReviews();
          } else {
            setError(res.message);
            setAlertType("error");
          }
        })
        .catch((err) => {
          setError(err.message);
          setAlertType("error");
        });
    } else {
      api
        .createProductReview(payload)
        .then((res) => {
          if (res.success) {
            setError(res.message);
            setAlertType("success");
            setFormRating(0);
            setFormComment("");
            fetchReviews();
          } else {
            setError(res.message);
            setAlertType("error");
          }
        })
        .catch((err) => {
          setError(err.message);
          setAlertType("error");
        });
    }
  };

  // Helper to render star rating dynamically
  const renderStars = (rating, size = 18, color = "#ffc107") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={size}
          color={color}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: "row", alignItems: "center" }}>{stars}</View>;
  };

  // Helper to render rating distribution breakdown
  const renderRatingDistribution = () => {
    const stars = ["5", "4", "3", "2", "1"];
    return (
      <View style={styles.distributionContainer} testID="product-detail-reviews-distribution">
        {stars.map((star) => {
          const count = ratingDistribution[star] || 0;
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <View key={star} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{star} star</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Helper to render review author, date, comment, verified badge & actions
  const renderReviewCard = (review) => {
    const formattedDate = review.createdAt ? review.createdAt.split("T")[0] : "";
    const isUserReview = currentUser && review.user._id === currentUser._id;
    const isAdminUser = currentUser && currentUser.userType === "ADMIN";

    return (
      <View key={review._id} style={[styles.reviewCard, review.hidden && styles.hiddenReviewCard]} testID={`review-card-${review._id}`}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewAuthor}>{review.user.name}</Text>
          <Text style={styles.reviewDate}>{formattedDate}</Text>
        </View>
        <View style={styles.reviewRatingRow}>
          {renderStars(review.rating, 14)}
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
            <Text style={[styles.verifiedText, { color: "#2E7D32" }]}>Verified Purchase</Text>
          </View>
          {review.hidden && (
            <View style={styles.hiddenBadge}>
              <Text style={styles.hiddenBadgeText}>Hidden</Text>
            </View>
          )}
        </View>
        {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}

        {(isUserReview || isAdminUser) && (
          <View style={styles.reviewActions}>
            {isUserReview && !isEditing && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setFormRating(review.rating);
                  setFormComment(review.comment || "");
                  setIsEditing(true);
                }}
              >
                <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
            {isAdminUser && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleToggleVisibility(review._id)}
                testID={`review-toggle-visibility-${review._id}`}
              >
                <Ionicons
                  name={review.hidden ? "eye-outline" : "eye-off-outline"}
                  size={14}
                  color={colors.muted}
                />
                <Text style={styles.actionBtnText}>{review.hidden ? "Show" : "Hide"}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDeleteReview(review._id)}
              testID={`review-delete-${review._id}`}
            >
              <Ionicons name="trash-outline" size={14} color={colors.danger} />
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Helper to render the interactive review creation/editing form
  const renderReviewForm = () => {
    if (!currentUser) {
      return (
        <View style={styles.formContainer} testID="product-detail-review-form-login-prompt">
          <Text style={styles.formTitle}>Want to write a review?</Text>
          <Text style={styles.formSubtitle}>Please log in to share your experience.</Text>
        </View>
      );
    }

    if (!canReview) {
      return (
        <View style={styles.formContainer} testID="product-detail-review-form-not-verified">
          <Text style={styles.formTitle}>Verified Purchase Required</Text>
          <Text style={styles.formSubtitle}>Only customers who purchased this product can leave a review.</Text>
        </View>
      );
    }

    if (hasReviewed && !isEditing) {
      return (
        <View style={styles.formContainer} testID="product-detail-review-form-already-reviewed">
          <Text style={styles.formTitle}>Thank you for your review!</Text>
          <Text style={styles.formSubtitle}>You have already reviewed this product. You can update or delete your review above.</Text>
        </View>
      );
    }

    const starRatings = [1, 2, 3, 4, 5];

    return (
      <View style={styles.formContainer} testID="product-detail-review-form">
        <Text style={styles.formTitle}>{isEditing ? "Edit Your Review" : "Write a Review"}</Text>
        
        <View style={formStarsRowStyle}>
          {starRatings.map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setFormRating(star)}
              style={{ padding: 5 }}
              testID={`review-form-star-${star}`}
            >
              <Ionicons
                name={star <= formRating ? "star" : "star-outline"}
                size={32}
                color="#ffc107"
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={formComment}
          onChangeText={setFormComment}
          placeholder="Optional: Write a comment (up to 500 characters)..."
          numberOfLines={4}
          multiline={true}
          style={styles.formCommentInput}
          testID="review-form-comment"
          maxLength={500}
        />

        <View style={styles.formFooterRow}>
          <Text style={styles.charCountText}>{formComment.length} / 500 characters</Text>
          <View style={{ flexDirection: "row" }}>
            {isEditing && (
              <TouchableOpacity
                style={[styles.formBtn, styles.cancelFormBtn]}
                onPress={() => {
                  setIsEditing(false);
                  setFormRating(0);
                  setFormComment("");
                }}
              >
                <Text style={styles.cancelFormBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.formBtn} onPress={handleSubmitReview} testID="review-form-submit">
              <Text style={styles.formBtnText}>{isEditing ? "Save Updates" : "Submit Review"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const formStarsRowStyle = {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
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

  //set quantity, avaiableQuantity, product image, fetch wishlist, current user, and reviews on initial render
  useEffect(() => {
    setQuantity(0);
    setAvaiableQuantity(product.quantity);
    SetProductImage(`${network.serverip}/uploads/${product?.image}`);
    fetchWishlist();
    fetchReviews();
    const loadUser = async () => {
      const user = await session.getUser();
      setCurrentUser(user);
    };
    loadUser();
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
          <ScrollView
            style={styles.productInfoTopContainer}
            contentContainerStyle={styles.productInfoTopContent}
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

            {/* Reviews Section */}
            <View style={styles.divider} />
            
            <View style={styles.reviewsSectionHeader}>
              <Text style={styles.sectionTitle} testID="product-detail-reviews-title">Ratings & Reviews</Text>
              <View style={styles.reviewsAggregateRow}>
                {renderStars(averageRating, 22)}
                <Text style={styles.averageRatingText} testID="product-detail-average-rating">
                  {averageRating.toFixed(1)} out of 5
                </Text>
              </View>
              <Text style={styles.totalCountText} testID="product-detail-reviews-count">
                ({totalCount} {totalCount === 1 ? "review" : "reviews"})
              </Text>
            </View>

            {/* Rating distribution bar charts */}
            {renderRatingDistribution()}

            {/* Interactive Review Form */}
            {renderReviewForm()}

            {/* Reviews list */}
            <View style={styles.reviewsListContainer} testID="product-detail-reviews-list">
              <Text style={styles.reviewsListTitle}>Recent Reviews</Text>
              {reviewsList.length === 0 ? (
                <Text style={styles.noReviewsText} testID="product-detail-no-reviews">No reviews yet. Be the first to review this product!</Text>
              ) : (
                reviewsList.map((review) => renderReviewCard(review))
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
  productInfoTopContent: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 30,
  },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: colors.shadow,
    marginVertical: 20,
  },
  reviewsSectionHeader: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
  },
  reviewsAggregateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  averageRatingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginLeft: 10,
  },
  totalCountText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  distributionContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  distributionLabel: {
    width: 50,
    fontSize: 12,
    color: colors.muted,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.shadow,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ffc107",
    borderRadius: 4,
  },
  distributionCount: {
    width: 25,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
  reviewsListContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  reviewsListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  noReviewsText: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 15,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.shadow,
    width: "100%",
  },
  hiddenReviewCard: {
    opacity: 0.6,
    backgroundColor: colors.light,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.muted,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#E2FBE9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  hiddenBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  hiddenBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "bold",
  },
  reviewComment: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 18,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.shadow,
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  actionBtnText: {
    fontSize: 12,
    marginLeft: 4,
    color: colors.muted,
  },
  deleteBtn: {
    // Styling if needed
  },
  formContainer: {
    width: "90%",
    backgroundColor: colors.light,
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    alignItems: "center",
    alignSelf: "center",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 10,
  },
  formCommentInput: {
    width: "100%",
    backgroundColor: colors.white,
    borderColor: colors.shadow,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
    marginVertical: 10,
    fontSize: 14,
    color: colors.dark,
  },
  formFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  charCountText: {
    fontSize: 11,
    color: colors.muted,
  },
  formBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  formBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  cancelFormBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.muted,
  },
  cancelFormBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "bold",
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
});
