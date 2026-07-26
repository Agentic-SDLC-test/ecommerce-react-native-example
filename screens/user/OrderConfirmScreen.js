import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  getEffectivePaymentStatus,
} from "../../constants/payment";

export const getConfirmationMessage = (order = {}) => {
  const paymentStatus = getEffectivePaymentStatus(order);

  if (order.payment_type === PAYMENT_METHODS.WALLET) {
    if (paymentStatus === "paid") {
      return "Your wallet payment is confirmed and your order is ready for fulfillment.";
    }
    if (paymentStatus === "failed") {
      return "Your order was created, but the wallet payment failed. You can retry from My Orders.";
    }

    return "Your order was created with a pending wallet payment. Complete it from My Orders when you are ready.";
  }

  return "Your order is confirmed. Cash on delivery will be collected when the order is delivered.";
};

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order;

  //method to get authUser from session
  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  //fetch user data on initial render
  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">Order has be confirmed</Text>
      {order ? (
        <View style={styles.summaryCard} testID="order-confirm-summary">
          <Text style={styles.orderMetaText} testID="order-confirm-order-id">
            Order # {order?.orderId}
          </Text>
          <Text style={styles.orderMetaText} testID="order-confirm-payment-method">
            Payment Method: {PAYMENT_METHOD_LABELS[order?.payment_type] || PAYMENT_METHOD_LABELS.cod}
          </Text>
          <View style={styles.badgeRow}>
            <Text style={styles.orderMetaText} testID="order-confirm-payment-status-label">
              Payment Status
            </Text>
            <PaymentStatusBadge
              paymentType={order?.payment_type}
              paymentStatus={order?.payment_status}
              fulfillmentStatus={order?.status}
              testID="order-confirm-payment-status"
            />
          </View>
          <Text style={styles.messageText} testID="order-confirm-message">
            {getConfirmationMessage(order)}
          </Text>
        </View>
      ) : null}
      <View>
        <CustomButton
          testID="order-confirm-home-btn"
          text={"Back to Home"}
          onPress={() => navigation.replace("tab", { user: user })}
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
    flex: 1,
  },
  imageConatiner: {
    width: "100%",
  },
  Image: {
    width: 400,
    height: 300,
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  summaryCard: {
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    elevation: 2,
  },
  orderMetaText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
  },
  badgeRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  messageText: {
    color: colors.dark,
    fontSize: 14,
  },
});
