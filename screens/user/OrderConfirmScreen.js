import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  PAYMENT_METHODS,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order || {};

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
      <View style={styles.paymentSummaryContainer}>
        <Text style={styles.paymentSummaryText} testID="order-confirm-payment-method">
          Payment Method: {getPaymentMethodLabel(order.payment_type)}
        </Text>
        <Text style={styles.paymentSummaryText} testID="order-confirm-payment-status">
          Payment Status: {getPaymentStatusLabel(order.payment_status, order.payment_type)}
        </Text>
        {order.payment_type === PAYMENT_METHODS.MOCK_WALLET && (
          <Text style={styles.mockPaymentNote} testID="order-confirm-mock-payment-note">
            Mock Wallet payment is simulated for this demo; no real money was processed.
          </Text>
        )}
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
  paymentSummaryContainer: {
    width: "85%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
  },
  paymentSummaryText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.muted,
    marginBottom: 5,
  },
  mockPaymentNote: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 5,
  },
});
