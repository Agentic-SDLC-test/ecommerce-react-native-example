import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import StarRating from "../StarRating";
import { formatReviewDate } from "../../utils/reviews";

const ReviewList = ({ review, showProduct = false, showStatus = false, actions, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.name} testID={testID ? `${testID}-name` : undefined}>
          {review?.reviewer?.name}
        </Text>
        <View style={styles.verifiedBadge} testID={testID ? `${testID}-verified` : undefined}>
          <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
          <Text style={styles.verifiedText}>Verified Purchase</Text>
        </View>
      </View>
      <StarRating rating={review?.rating || 0} size={14} />
      <Text style={styles.date} testID={testID ? `${testID}-date` : undefined}>
        {formatReviewDate(review?.postedAt)}
        {review?.edited ? " · Edited" : ""}
      </Text>
      {review?.text ? (
        <Text style={styles.text} testID={testID ? `${testID}-text` : undefined}>
          {review.text}
        </Text>
      ) : null}
      {showProduct && (
        <Text style={styles.product} testID={testID ? `${testID}-product` : undefined}>
          {review?.product?.title}
        </Text>
      )}
      {showStatus && (
        <View
          style={[styles.statusBadge, review?.hidden && styles.statusBadgeHidden]}
          testID={testID ? `${testID}-status` : undefined}
        >
          <Text style={[styles.statusText, review?.hidden && styles.statusTextHidden]}>
            {review?.hidden ? "Hidden" : "Visible"}
          </Text>
        </View>
      )}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
  },
  verifiedBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 11,
    color: colors.dark,
    marginLeft: 3,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: colors.dark,
    marginTop: 2,
  },
  product: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    fontWeight: "600",
  },
  statusBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.primary_light,
  },
  statusBadgeHidden: {
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  statusTextHidden: {
    color: colors.white,
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    marginTop: 8,
  },
});
