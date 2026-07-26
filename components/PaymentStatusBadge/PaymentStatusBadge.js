import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  getEffectivePaymentStatus,
} from "../../constants/payment";

export const getPaymentBadgeModel = ({
  paymentType,
  paymentStatus,
  fulfillmentStatus,
}) => {
  const status = getEffectivePaymentStatus({
    payment_type: paymentType,
    payment_status: paymentStatus,
    status: fulfillmentStatus,
  });

  return {
    status,
    label: PAYMENT_STATUS_LABELS[status],
    color: PAYMENT_STATUS_COLORS[status] || colors.muted,
  };
};

const PaymentStatusBadge = ({
  paymentType,
  paymentStatus,
  fulfillmentStatus,
  testID,
}) => {
  const badge = getPaymentBadgeModel({
    paymentType,
    paymentStatus,
    fulfillmentStatus,
  });

  return (
    <View
      style={[styles.badge, { backgroundColor: badge.color }]}
      testID={testID}
    >
      <Text
        style={styles.badgeText}
        testID={testID ? `${testID}-label` : undefined}
      >
        {badge.label}
      </Text>
    </View>
  );
};

export default PaymentStatusBadge;

const styles = StyleSheet.create({
  badge: {
    minWidth: 90,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.dark,
    fontWeight: "700",
    fontSize: 12,
  },
});
