import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ReviewCard from "../ReviewCard/ReviewCard";

// Presentational list of reviews. Shared by the shopper-facing recent-reviews
// feed on ProductDetailScreen and the admin moderation list on
// ViewReviewsScreen (via the isAdmin / onModerate / onRemove props).
const ReviewList = ({ reviews, isAdmin = false, onModerate, onRemove, emptyText = "No reviews yet.", testID }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID ? `${testID}-empty` : undefined}>
        <Text testID={testID ? `${testID}-empty-text` : undefined}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {reviews.map((review, index) => (
        <ReviewCard
          key={review._id || index}
          review={review}
          isAdmin={isAdmin}
          onModerate={onModerate}
          onRemove={onRemove}
          testID={testID ? `${testID}-item-${index}` : undefined}
        />
      ))}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  emptyContainer: {
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
});
