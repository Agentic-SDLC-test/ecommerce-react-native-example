import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import * as session from "../../utils/session";
import {
  canResumeWalletPayment,
  getPaymentMethodLabel,
} from "../../utils/paymentPresentation";
import { isWalletMockEnabled } from "../../utils/featureFlags";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order || null;
  const walletEnabled = isWalletMockEnabled();

  const canResumePayment = walletEnabled && canResumeWalletPayment(order);
  const resumeLabel =
    order?.payment_status === "pending"
      ? "Resume wallet payment"
      : "Try wallet payment again";

  const confirmationHeadline = useMemo(() => {
    if (!order) {
      return "Order has been confirmed";
    }

    return `Order ${order.orderId} has been confirmed`;
  }, [order]);

  useEffect(() => {
    const getUserData = async () => {
      const value = await session.getUser();
      setUser(value || {});
    };

    getUserData();
  }, []);

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image
          source={SuccessImage}
          style={styles.Image}
          testID="order-confirm-image"
        />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">
        {confirmationHeadline}
      </Text>

      {order && (
        <View style={styles.summaryCard}>
          <Text style={styles.metaLabel} testID="order-confirm-method-label">
            Payment method
          </Text>
          <Text style={styles.metaValue} testID="order-confirm-method-value">
            {getPaymentMethodLabel(order.payment_type)}
          </Text>

          <Text style={styles.metaLabel} testID="order-confirm-status-label">
            Payment status
          </Text>
          <PaymentStatusBadge
            paymentStatus={order.payment_status}
            paymentType={order.payment_type}
            testID="order-confirm-status-badge"
          />
        </View>
      )}

      <View style={styles.actions}>
        {canResumePayment && (
          <CustomButton
            testID="order-confirm-resume-btn"
            text={resumeLabel}
            onPress={() => navigation.replace("walletpayment", { order })}
          />
        )}
        <CustomButton
          testID="order-confirm-home-btn"
          text={"Back to Home"}
          onPress={() => navigation.replace("tab", { user })}
        />
      </View>
    </View>
  );
};

export default OrderConfirmScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
    paddingHorizontal: 20,
    flex: 1,
  },
  imageConatiner: {
    width: "100%",
    alignItems: "center",
  },
  Image: {
    width: 320,
    height: 240,
    resizeMode: "contain",
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 8,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  metaValue: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {
    width: "100%",
  },
});
