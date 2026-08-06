import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { paymentStatusLabel, paymentStatusTone } from "../../utils/payment";

// Derives everything from the order already in memory — no network call, so the
// read surfaces issue exactly the same number of requests as before.
const PaymentStatusBadge = ({ order, testID }) => {
  const label = paymentStatusLabel(order);
  const tone = paymentStatusTone(order);

  return (
    <View
      style={[styles.badge, { backgroundColor: tone.backgroundColor }]}
      accessibilityLabel={"Payment: " + label}
      testID={testID}
    >
      <Text
        style={[styles.badgeText, { color: tone.textColor }]}
        testID={testID ? `${testID}-text` : undefined}
      >
        {label}
      </Text>
    </View>
  );
};

export default PaymentStatusBadge;

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
});
