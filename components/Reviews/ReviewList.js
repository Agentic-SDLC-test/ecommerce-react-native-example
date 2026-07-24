import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants";
import RatingStars from "./RatingStars";

const viewerMessages = {
  LOGIN_REQUIRED: "Log in to review after purchase.",
  PURCHASE_REQUIRED: "Review available after delivery.",
  REVIEW_EXISTS: "Edit your review",
  REMOVED_BY_ADMIN: "This review was removed by an administrator.",
};

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ReviewCard = ({ review, testID, heading }) => {
  return (
    <View style={styles.reviewCard} testID={testID}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewUser} testID={testID ? `${testID}-name` : undefined}>
            {review?.user?.name || "Your review"}
          </Text>
          <Text style={styles.reviewDate}>{formatDate(review?.updatedAt || review?.createdAt)}</Text>
        </View>
        <RatingStars readonly value={review?.rating || 0} size={16} />
      </View>
      {heading ? <Text style={styles.reviewHeading}>{heading}</Text> : null}
      <Text style={styles.reviewComment} testID={testID ? `${testID}-comment` : undefined}>
        {review?.comment}
      </Text>
      {review?.verifiedPurchase ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Verified Purchase</Text>
        </View>
      ) : null}
    </View>
  );
};

const ReviewList = ({ reviews = [], viewer, testID }) => {
  const viewerMessage = viewer?.reason ? viewerMessages[viewer.reason] : "";
  const removedReview = viewer?.review?.status === "removed" ? viewer.review : null;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title} testID={testID ? `${testID}-title` : undefined}>
        Recent reviews
      </Text>
      {viewerMessage ? (
        <View style={styles.viewerMessage} testID={testID ? `${testID}-viewer-message` : undefined}>
          <Text style={styles.viewerMessageText}>{viewerMessage}</Text>
        </View>
      ) : null}
      {removedReview ? (
        <ReviewCard
          review={{ ...removedReview, user: { name: "Your removed review" } }}
          heading="Stored review"
          testID={testID ? `${testID}-removed-review` : undefined}
        />
      ) : null}
      {reviews.length === 0 ? (
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No published reviews yet.
        </Text>
      ) : (
        reviews.map((review, index) => (
          <ReviewCard
            review={review}
            key={review._id || index}
            testID={testID ? `${testID}-item-${index}` : undefined}
          />
        ))
      )}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 10,
  },
  viewerMessage: {
    backgroundColor: colors.info,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  viewerMessageText: {
    color: colors.muted,
    fontWeight: "600",
  },
  emptyText: {
    color: colors.muted,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewUser: {
    color: colors.dark,
    fontWeight: "700",
  },
  reviewDate: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  reviewHeading: {
    color: colors.muted,
    fontWeight: "700",
    marginBottom: 4,
  },
  reviewComment: {
    color: colors.dark,
    lineHeight: 20,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: colors.primary_light,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: colors.primary_shadow,
    fontWeight: "700",
    fontSize: 12,
  },
});
