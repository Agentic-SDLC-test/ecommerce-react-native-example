import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/paymentDisplay";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order;

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
      {order ? (
        <View style={styles.paymentSummaryContainer}>
          <Text style={styles.summaryText} testID="order-confirm-order-id">
            Order # {order.orderId}
          </Text>
          <Text style={styles.summaryText} testID="order-confirm-payment-method">
            Payment method: {getPaymentMethodLabel(order.payment_type)}
          </Text>
          <Text style={styles.summaryText} testID="order-confirm-payment-status">
            Payment status: {getPaymentStatusLabel(order.payment_status, order.payment_type)}
          </Text>
          <Text style={styles.summaryTextMuted}>
            Shipping status: {order.status || "pending"}
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
  paymentSummaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    width: "85%",
    elevation: 1,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 6,
  },
  summaryTextMuted: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
});
