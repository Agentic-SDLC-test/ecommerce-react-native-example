import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors, getPaymentStatusLabel, getPaymentStatusColor } from "../../constants";

// Small colored badge for a payment state, reused on every read surface
// (confirmation, order history list, order detail, admin order detail).
// Tolerates a missing/legacy `status` — renders "Awaiting Payment" via the
// shared normalization in constants/Payment.js.
const PaymentStatusBadge = ({ status, testID }) => {
  return (
    <View
      style={[styles.badge, { backgroundColor: getPaymentStatusColor(status, colors) }]}
      testID={testID ? `${testID}-container` : undefined}
    >
      <Text style={styles.text} testID={testID}>
        {getPaymentStatusLabel(status)}
      </Text>
    </View>
  );
};

export default PaymentStatusBadge;

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
});
