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
  Alert,
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

  // ---- Reviews State Variables ----
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0.0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Sorting and Filtering
  const [selectedStarFilter, setSelectedStarFilter] = useState(null);
  const [selectedSort, setSelectedSort] = useState("newest"); // "newest", "highest", "lowest"

  // Write/Edit Review Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Method to fetch reviews and aggregate statistics from server
  const fetchReviewsAndStats = () => {
    api
      .getReviews(product?._id, selectedStarFilter, selectedSort)
      .then((result) => {
        if (result.success) {
          setReviews(result.reviews || []);
          setRatingStats(
            result.ratingStats || {
              averageRating: 0.0,
              totalReviews: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            }
          );
          setUserHasPurchased(result.userHasPurchased);
          setUserReview(result.userReview);

          if (result.userReview) {
            setModalRating(result.userReview.rating);
            setModalComment(result.userReview.comment || "");
          }
        }
      })
      .catch((err) => {
        console.log("Error fetching reviews:", err);
      });
  };

  const handleOpenReviewModal = () => {
    if (userReview) {
      setModalRating(userReview.rating);
      setModalComment(userReview.comment || "");
    } else {
      setModalRating(5);
      setModalComment("");
    }
    setIsModalVisible(true);
  };

  const handleSubmitReview = () => {
    if (modalRating < 1 || modalRating > 5) {
      Alert.alert("Error", "Please select a rating between 1 and 5 stars.");
      return;
    }
    setSubmittingReview(true);
    api
      .submitReview(product?._id, {
        rating: modalRating,
        comment: modalComment.trim(),
      })
      .then((result) => {
        if (result.success) {
          setIsModalVisible(false);
          setAlertType("success");
          setError("Review submitted successfully");
          fetchReviewsAndStats();
        } else {
          setAlertType("error");
          setError(result.message);
        }
        setSubmittingReview(false);
      })
      .catch((err) => {
        setAlertType("error");
        setError(err.message);
        setSubmittingReview(false);
      });
  };

  const renderAverageStars = (avg) => {
    const stars = [];
    const floor = Math.floor(avg);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= floor ? "star" : i - 0.5 <= avg ? "star-half" : "star-outline"}
          size={14}
          color={colors.warning}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderDistributionRows = () => {
    const rows = [];
    const dist = ratingStats.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const total = ratingStats.totalReviews || 0;

    for (let s = 5; s >= 1; s--) {
      const count = dist[s] || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;

      rows.push(
        <TouchableOpacity
          key={s}
          style={[
            styles.distRow,
            selectedStarFilter === s && styles.distRowSelected,
          ]}
          onPress={() => {
            if (selectedStarFilter === s) {
              setSelectedStarFilter(null);
            } else {
              setSelectedStarFilter(s);
            }
          }}
          testID={`filter-star-row-${s}`}
        >
          <Text style={styles.distLabel}>{s} ★</Text>
          <View style={styles.distBarBg}>
            <View style={[styles.distBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.distCount}>{count}</Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.distContainer}>{rows}</View>;
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

  //set quantity, avaiableQuantity, product image, reviews, and fetch wishlist on initial render
  useEffect(() => {
    setQuantity(0);
    setAvaiableQuantity(product.quantity);
    SetProductImage(`${network.serverip}/uploads/${product?.image}`);
    fetchWishlist();
    fetchReviewsAndStats();
  }, []);

  // Re-fetch reviews whenever filter or sorting changes
  useEffect(() => {
    fetchReviewsAndStats();
  }, [selectedStarFilter, selectedSort]);

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
        <ScrollView
          testID="product-detail-scroll"
          style={{ width: "100%", flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productImageContainer}>
            <Image source={{ uri: productImage }} style={styles.productImage} testID="product-detail-image" />
          </View>
          <CustomAlert message={error} type={alertType} testID="product-detail-alert" />
          <View style={styles.productInfoContainer}>
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

            {/* ---- REVIEWS SECTION ---- */}
            <View style={styles.reviewsSectionContainer}>
              <Text style={styles.reviewsSectionHeading} testID="reviews-section-heading">Customer Feedback</Text>
              
              <View style={styles.aggregatesRow}>
                <View style={styles.avgRatingBlock}>
                  <Text style={styles.avgRatingVal}>{ratingStats.averageRating || "0.0"}</Text>
                  <Text style={styles.avgRatingOutOf}>out of 5</Text>
                  {renderAverageStars(ratingStats.averageRating)}
                  <Text style={styles.totalReviewsText}>({ratingStats.totalReviews} reviews)</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  {renderDistributionRows()}
                </View>
              </View>

              {/* Sorting and Filtering Header */}
              <View style={styles.filterSortHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.sectionSubtitle}>Recent Reviews</Text>
                  {selectedStarFilter && (
                    <TouchableOpacity
                      style={styles.clearFilterBtn}
                      onPress={() => setSelectedStarFilter(null)}
                      testID="clear-filter-btn"
                    >
                      <Text style={styles.clearFilterText}>Clear ({selectedStarFilter}★)</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.sortDropdownContainer}>
                  <TouchableOpacity
                    style={[styles.sortBtn, selectedSort === "newest" && styles.sortBtnActive]}
                    onPress={() => setSelectedSort("newest")}
                    testID="sort-newest-btn"
                  >
                    <Text style={[styles.sortBtnText, selectedSort === "newest" && styles.sortBtnTextActive]}>Newest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortBtn, selectedSort === "highest" && styles.sortBtnActive]}
                    onPress={() => setSelectedSort("highest")}
                    testID="sort-highest-btn"
                  >
                    <Text style={[styles.sortBtnText, selectedSort === "highest" && styles.sortBtnTextActive]}>Highest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortBtn, selectedSort === "lowest" && styles.sortBtnActive]}
                    onPress={() => setSelectedSort("lowest")}
                    testID="sort-lowest-btn"
                  >
                    <Text style={[styles.sortBtnText, selectedSort === "lowest" && styles.sortBtnTextActive]}>Lowest</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Write / Edit Review Button */}
              {userHasPurchased ? (
                <TouchableOpacity
                  style={styles.writeReviewBtn}
                  onPress={handleOpenReviewModal}
                  testID="write-review-btn"
                >
                  <Ionicons name="pencil-sharp" size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.writeReviewBtnText}>
                    {userReview ? "Edit Your Review" : "Write a Review"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.notEligibleContainer} testID="not-eligible-container">
                  <Ionicons name="information-circle-outline" size={18} color={colors.muted} style={{ marginRight: 6 }} />
                  <Text style={styles.notEligibleText}>
                    Only verified purchasers of this product may submit reviews.
                  </Text>
                </View>
              )}

              {/* Reviews List */}
              <View style={styles.reviewsListContainer}>
                {reviews.length === 0 ? (
                  <Text style={styles.noReviewsText} testID="no-reviews-text">No reviews found.</Text>
                ) : (
                  reviews.map((rev, idx) => (
                    <View key={rev._id || idx} style={styles.reviewItemCard} testID={`product-review-item-${idx}`}>
                      <View style={styles.reviewItemHeader}>
                        <Text style={styles.reviewItemUser}>{rev.user?.name || "Anonymous"}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          {rev.verified && (
                            <View style={styles.verifiedBadgeSm} testID="verified-badge">
                              <Text style={styles.verifiedBadgeTextSm}>Verified Purchase</Text>
                            </View>
                          )}
                          {renderAverageStars(rev.rating)}
                        </View>
                      </View>
                      {rev.comment ? (
                        <Text style={styles.reviewItemComment}>{rev.comment}</Text>
                      ) : (
                        <Text style={[styles.reviewItemComment, { fontStyle: "italic", color: colors.muted }]}>
                          Rating only submission.
                        </Text>
                      )}
                      <Text style={styles.reviewItemDate}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ---- REVIEW SUBMISSION OVERLAY MODAL ---- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        testID="review-submission-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} testID="review-modal-title">
                {userReview ? "Edit Your Review" : "Write a Product Review"}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} testID="close-review-modal-btn">
                <Ionicons name="close-circle" size={26} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Your Rating:</Text>
              <View style={styles.modalStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setModalRating(star)}
                    testID={`write-review-star-${star}`}
                  >
                    <Ionicons
                      name={star <= modalRating ? "star" : "star-outline"}
                      size={40}
                      color={colors.warning}
                      style={{ marginHorizontal: 6 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalSubtitle}>Your Review (Optional):</Text>
              <TextInput
                style={styles.modalCommentInput}
                placeholder="Write your review comments here (up to 1000 characters)..."
                placeholderTextColor={colors.muted}
                multiline={true}
                numberOfLines={5}
                value={modalComment}
                onChangeText={setModalComment}
                maxLength={1000}
                testID="review-comment-input"
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setIsModalVisible(false)}
                  testID="cancel-review-btn"
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSubmit]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                  testID="submit-review-btn"
                >
                  <Text style={styles.modalBtnSubmitText}>
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flexDirection: "column",
    justifyContent: "flex-start",
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
  // ---- Reviews Styling Classes ----
  reviewsSectionContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 10,
  },
  reviewsSectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 15,
  },
  aggregatesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avgRatingBlock: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 15,
    width: 120,
  },
  avgRatingVal: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.dark,
  },
  avgRatingOutOf: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 5,
  },
  totalReviewsText: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 5,
  },
  distContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distRowSelected: {
    backgroundColor: colors.light,
  },
  distLabel: {
    fontSize: 11,
    color: colors.muted,
    width: 25,
  },
  distBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.light,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  distBarFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  distCount: {
    fontSize: 11,
    color: colors.muted,
    width: 15,
    textAlign: "right",
  },
  filterSortHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  clearFilterBtn: {
    marginLeft: 10,
    backgroundColor: colors.light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  clearFilterText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "bold",
  },
  sortDropdownContainer: {
    flexDirection: "row",
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.light,
    marginLeft: 6,
  },
  sortBtnActive: {
    backgroundColor: colors.primary_light,
  },
  sortBtnText: {
    fontSize: 11,
    color: colors.muted,
  },
  sortBtnTextActive: {
    color: colors.primary_shadow,
    fontWeight: "bold",
  },
  writeReviewBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  writeReviewBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  notEligibleContainer: {
    flexDirection: "row",
    backgroundColor: colors.light,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  notEligibleText: {
    color: colors.muted,
    fontSize: 12,
    flex: 1,
  },
  reviewsListContainer: {
    marginTop: 10,
  },
  noReviewsText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginVertical: 20,
  },
  reviewItemCard: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  reviewItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewItemUser: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.dark,
  },
  verifiedBadgeSm: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
  },
  verifiedBadgeTextSm: {
    color: "#2E7D32",
    fontSize: 9,
    fontWeight: "bold",
  },
  reviewItemComment: {
    fontSize: 13,
    color: colors.dark,
    lineHeight: 18,
    marginVertical: 4,
  },
  reviewItemDate: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  // Modal Overlay and Content
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    paddingBottom: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  modalBody: {
    flexDirection: "column",
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.muted,
    marginBottom: 8,
    marginTop: 10,
  },
  modalStarsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 5,
  },
  modalCommentInput: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.dark,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  modalBtnCancel: {
    backgroundColor: colors.light,
  },
  modalBtnCancelText: {
    color: colors.muted,
    fontWeight: "bold",
    fontSize: 14,
  },
  modalBtnSubmit: {
    backgroundColor: colors.primary,
  },
  modalBtnSubmitText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});
