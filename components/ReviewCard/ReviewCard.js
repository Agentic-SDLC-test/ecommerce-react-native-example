import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import StarRating from "../StarRating";
import { formatReviewDate, isVerifiedPurchase } from "../../utils/reviews";

// One review row, used by both the shopper list and the admin list. Only
// privacy-safe fields are read — display name and date, never contact or
// order details.
const ReviewCard = ({
  item,
  productTitle,
  showVisibility = false,
  onToggleVisibility,
  isBusy = false,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.innerRow}>
        <StarRating value={item?.rating} size={14} testID={testID ? `${testID}-stars` : undefined} />
        <Text style={styles.secondaryTextSm} testID={testID ? `${testID}-date` : undefined}>
          {formatReviewDate(item?.createdAt)}
        </Text>
      </View>
      <View style={styles.innerRow}>
        <Text style={styles.primaryText} testID={testID ? `${testID}-name` : undefined}>
          {item?.user?.name}
        </Text>
        {productTitle ? (
          <Text style={styles.secondaryTextSm} testID={testID ? `${testID}-product` : undefined}>
            {productTitle}
          </Text>
        ) : (
          <></>
        )}
      </View>
      {/* the badge asserts a real purchase, so it follows the stored flag
          rather than being assumed for every row */}
      {isVerifiedPurchase(item) ? (
        <View style={styles.badgeRow}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.badgeText} testID={testID ? `${testID}-verified` : undefined}>
            Verified purchase
          </Text>
        </View>
      ) : (
        <></>
      )}
      {item?.comment ? (
        <View style={styles.commentRow}>
          <Text style={styles.commentText} testID={testID ? `${testID}-comment` : undefined}>
            {item?.comment}
          </Text>
        </View>
      ) : (
        <></>
      )}
      {showVisibility ? (
        <View style={styles.innerRow}>
          <Text style={styles.secondaryText} testID={testID ? `${testID}-visibility` : undefined}>
            {item?.isVisible ? "Visible" : "Hidden"}
          </Text>
          <TouchableOpacity
            style={styles.toggleButton}
            disabled={isBusy}
            onPress={() => onToggleVisibility && onToggleVisibility(item)}
            testID={testID ? `${testID}-toggle-btn` : undefined}
          >
            <Text testID={testID ? `${testID}-toggle-text` : undefined}>
              {item?.isVisible ? "Hide" : "Unhide"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "auto",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  innerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  badgeRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 2,
  },
  commentRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  primaryText: {
    fontSize: 15,
    color: colors.dark,
    fontWeight: "bold",
  },
  secondaryText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
  },
  secondaryTextSm: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "bold",
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.muted,
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 14,
    color: colors.dark,
  },
  toggleButton: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 5,
    borderColor: colors.muted,
    color: colors.muted,
    width: 100,
  },
});
