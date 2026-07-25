import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusMessage,
} from "../../utils/payments";

function formatDeliveryStatus(status) {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order || null;
  const paymentMessage = useMemo(() => getPaymentStatusMessage(order || {}), [order]);

  useEffect(() => {
    async function getUserData() {
      const value = await session.getUser();
      setUser(value || {});
    }

    getUserData();
  }, []);

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">
        Order has been confirmed
      </Text>
      {order ? (
        <View style={styles.summaryCard} testID="order-confirm-payment-summary">
          <Text style={styles.summaryHeading}>Payment summary</Text>
          <Text testID="order-confirm-payment-method">
            Method: {getPaymentMethodLabel(order.payment_type)}
          </Text>
          <Text testID="order-confirm-payment-status">
            Payment: {getPaymentStatusLabel(order.payment_status)}
          </Text>
          <Text testID="order-confirm-delivery-status">
            Delivery: {formatDeliveryStatus(order.status)}
          </Text>
          <Text style={styles.summaryTitle} testID="order-confirm-payment-title">
            {paymentMessage.title}
          </Text>
          <Text style={styles.summaryDetail} testID="order-confirm-payment-detail">
            {paymentMessage.detail}
          </Text>
        </View>
      ) : null}
      <View style={styles.buttonContainer}>
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
    paddingHorizontal: 20,
    flex: 1,
  },
  imageConatiner: {
    width: "100%",
    alignItems: "center",
  },
  Image: {
    width: 320,
    height: 260,
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 6,
    elevation: 3,
  },
  summaryHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.muted,
  },
  summaryTitle: {
    marginTop: 6,
    fontWeight: "bold",
    color: colors.primary,
  },
  summaryDetail: {
    color: colors.muted,
  },
  buttonContainer: {
    width: "100%",
  },
});
