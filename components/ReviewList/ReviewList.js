import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import RatingStars from "../RatingStars";
import VerifiedPurchaseBadge from "../VerifiedPurchaseBadge";
import { reviewerDisplayName } from "../../utils/reviews";

const dateFormat = (datex) => {
  let t = new Date(datex);
  const date = ("0" + t.getDate()).slice(-2);
  const month = ("0" + (t.getMonth() + 1)).slice(-2);
  const year = t.getFullYear();

  return `${date}-${month}-${year}`;
};

// One review card. Named and shaped like OrderList / UserList / WishList — the
// caller maps over the collection. Renders a display name, the verdict and the
// date; never an email and never an order reference.
const ReviewList = ({ item, actions, showVisibility = false, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.innerRow}>
        <Text
          style={styles.primaryText}
          testID={testID ? `${testID}-name` : undefined}
        >
          {reviewerDisplayName(item)}
        </Text>
        <Text
          style={styles.secondaryTextSm}
          testID={testID ? `${testID}-date` : undefined}
        >
          {dateFormat(item?.createdAt)}
        </Text>
      </View>
      <View style={styles.leftRow}>
        <RatingStars
          rating={item?.rating}
          testID={testID ? `${testID}-rating` : undefined}
        />
      </View>
      <View style={styles.leftRow}>
        <VerifiedPurchaseBadge
          review={item}
          showVisibility={showVisibility}
          testID={testID ? `${testID}-badge` : undefined}
        />
      </View>
      {item?.text ? (
        <View style={styles.leftRow}>
          <Text
            style={styles.secondaryText}
            testID={testID ? `${testID}-text` : undefined}
          >
            {item?.text}
          </Text>
        </View>
      ) : (
        <></>
      )}
      {actions ? <View style={styles.actionRow}>{actions}</View> : <></>}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
  leftRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  primaryText: {
    fontSize: 15,
    color: colors.dark,
    fontWeight: "bold",
  },
  secondaryTextSm: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "bold",
  },
  secondaryText: {
    fontSize: 14,
    color: colors.muted,
  },
});
