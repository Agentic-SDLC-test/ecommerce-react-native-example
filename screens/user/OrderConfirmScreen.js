import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  PAYMENT_STATUSES,
} from "../../constants/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route.params?.order;

  const getPaymentStatusDisplay = () => {
    if (order?.payment_status) {
      return getPaymentStatusLabel(order.payment_status);
    }
    if (order?.payment_type === "cod") {
      return getPaymentStatusLabel(PAYMENT_STATUSES.PAY_ON_DELIVERY);
    }
    return "—";
  };

  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

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
      {order && (
        <View style={styles.paymentSummary}>
          {order.orderId && (
            <Text style={styles.paymentText} testID="order-confirm-order-id">
              Order # {order.orderId}
            </Text>
          )}
          <Text style={styles.paymentText} testID="order-confirm-payment-method">
            Payment method: {getPaymentMethodLabel(order.payment_type)}
          </Text>
          <Text style={styles.paymentText} testID="order-confirm-payment-status">
            Payment status: {getPaymentStatusDisplay()}
          </Text>
        </View>
      )}
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
  paymentSummary: {
    marginVertical: 15,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  paymentText: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
});
