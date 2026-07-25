import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import {
  getPaymentStatusLabel,
  getPaymentStatusTone,
} from "../../utils/paymentPresentation";

const toneStyles = {
  muted: {
    backgroundColor: colors.info,
    borderColor: colors.shadow,
    color: colors.muted,
  },
  warning: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
    color: colors.dark,
  },
  success: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    color: colors.dark,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    color: colors.white,
  },
};

const PaymentStatusBadge = ({ paymentStatus, paymentType, testID }) => {
  const tone = getPaymentStatusTone(paymentStatus, paymentType);
  const style = toneStyles[tone] || toneStyles.warning;

  return (
    <View
      style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}
      testID={testID}
    >
      <Text
        style={[styles.text, { color: style.color }]}
        testID={testID ? `${testID}-text` : undefined}
      >
        {getPaymentStatusLabel(paymentStatus, paymentType)}
      </Text>
    </View>
  );
};

export default PaymentStatusBadge;

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
