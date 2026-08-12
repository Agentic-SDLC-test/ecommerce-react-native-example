import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  isVerifiedPurchase,
  resolveVisibility,
  reviewVisibilityTone,
} from "../../utils/reviews";
import {
  VERIFIED_PURCHASE_LABEL,
  MODERATION_LABELS,
  REVIEW_VISIBILITIES,
} from "../../constants/Reviews";
import { colors } from "../../constants";

// Styled exactly like PaymentStatusBadge so the two pills read as one system.
// A malformed row is never badged as verified, so this renders nothing rather
// than vouching for content the backend did not vouch for.
const VerifiedPurchaseBadge = ({ review, showVisibility = false, testID }) => {
  if (!isVerifiedPurchase(review)) {
    return null;
  }

  const visibility = resolveVisibility(review);
  const tone = reviewVisibilityTone(review);

  return (
    <View style={styles.row} testID={testID}>
      <View
        style={[styles.badge, { backgroundColor: colors.success }]}
        accessibilityLabel={VERIFIED_PURCHASE_LABEL}
        testID={testID ? `${testID}-verified` : undefined}
      >
        <Text
          style={[styles.badgeText, { color: colors.dark }]}
          testID={testID ? `${testID}-verified-text` : undefined}
        >
          {VERIFIED_PURCHASE_LABEL}
        </Text>
      </View>
      {showVisibility && (
        <View
          style={[
            styles.badge,
            styles.badgeSpacing,
            { backgroundColor: tone.backgroundColor },
          ]}
          testID={testID ? `${testID}-visibility` : undefined}
        >
          <Text
            style={[styles.badgeText, { color: tone.textColor }]}
            testID={testID ? `${testID}-visibility-text` : undefined}
          >
            {visibility === REVIEW_VISIBILITIES.VISIBLE
              ? MODERATION_LABELS.visible_badge
              : MODERATION_LABELS.hidden_badge}
          </Text>
        </View>
      )}
    </View>
  );
};

export default VerifiedPurchaseBadge;

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  badgeSpacing: {
    marginLeft: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
});
