import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  normalizeOrderPayment,
  formatPaymentMethod,
  formatPaymentStatus,
} from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order;
  const payment = normalizeOrderPayment(order || {});

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
      <View style={styles.paymentInfoContainer}>
        <Text style={styles.paymentLabel} testID="order-confirm-payment-method">
          Payment method: {formatPaymentMethod(payment.payment_type)}
        </Text>
        <Text style={styles.paymentLabel} testID="order-confirm-payment-status">
          Payment status:{" "}
          {formatPaymentStatus(payment.payment_status, payment.payment_type)}
        </Text>
      </View>
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
  paymentInfoContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  paymentLabel: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 6,
  },
});
