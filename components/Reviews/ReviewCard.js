import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import RatingStars from "./RatingStars";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const date = ("0" + d.getDate()).slice(-2);
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const year = d.getFullYear();
  return `${date}-${month}-${year}`;
};

const ReviewCard = ({ review, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.nameText} testID={testID ? `${testID}-name` : undefined}>
          {review?.user?.name}
        </Text>
        <Text style={styles.dateText} testID={testID ? `${testID}-date` : undefined}>
          {formatDate(review?.updatedAt || review?.createdAt)}
        </Text>
      </View>
      <RatingStars rating={review?.rating || 0} size={16} testID={testID ? `${testID}-stars` : undefined} />
      {review?.verifiedPurchase && (
        <Text style={styles.verifiedText} testID={testID ? `${testID}-verified` : undefined}>
          Verified Purchase
        </Text>
      )}
      <Text style={styles.commentText} testID={testID ? `${testID}-comment` : undefined}>
        {review?.comment}
      </Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  dateText: {
    fontSize: 11,
    color: colors.muted,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: colors.dark,
    marginTop: 4,
  },
});
