import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import { getPaymentInfo } from "../../utils/payment";

const toneColor = {
  success: "#2e7d32",
  warning: "#b26a00",
  danger: "#c62828",
};

const PaymentBadge = ({ order, testID }) => {
  const { methodLabel, statusLabel, tone } = getPaymentInfo(order);
  return (
    <View
      style={[styles.badge, { backgroundColor: toneColor[tone] }]}
      testID={testID}
    >
      <Text style={styles.text} testID={testID ? `${testID}-text` : undefined}>
        {`${methodLabel} · ${statusLabel}`}
      </Text>
    </View>
  );
};

export default PaymentBadge;

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});
