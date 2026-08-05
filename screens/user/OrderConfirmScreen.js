import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  formatPaymentMethod,
  formatPaymentStatus,
  getPaymentMessage,
} from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});

  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  useEffect(() => {
    getUserData();
  }, []);

  const order = route?.params?.order || {};
  const paymentMethod = formatPaymentMethod(order.payment_type || "cod");
  const paymentStatus = formatPaymentStatus(
    order.payment_type || "cod",
    order.payment_status || "awaiting_payment"
  );
  const paymentMessage = getPaymentMessage(
    order.payment_type || "cod",
    order.payment_status || "awaiting_payment"
  );

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">
        Order has be confirmed
      </Text>
      <View style={styles.summaryCard} testID="order-confirm-payment-summary">
        <Text style={styles.summaryHeading} testID="order-confirm-summary-heading">
          Payment summary
        </Text>
        <Text style={styles.summaryText} testID="order-confirm-order-id">
          Order # {order.orderId || "Pending"}
        </Text>
        <Text style={styles.summaryText} testID="order-confirm-payment-method">
          Payment method: {paymentMethod}
        </Text>
        <Text style={styles.summaryText} testID="order-confirm-payment-status">
          Payment status: {paymentStatus}
        </Text>
        <Text style={styles.messageText} testID="order-confirm-payment-message">
          {paymentMessage}
        </Text>
      </View>
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
    width: "88%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  summaryHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: "bold",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: colors.muted,
  },
  buttonContainer: {
    width: "88%",
  },
});
