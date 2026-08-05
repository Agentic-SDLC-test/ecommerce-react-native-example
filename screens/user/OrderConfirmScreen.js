import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  getPaymentMessage,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const confirmedOrder = route?.params?.order || null;

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
      {confirmedOrder ? (
        <View style={styles.paymentCard} testID="order-confirm-payment-card">
          <Text style={styles.cardHeading} testID="order-confirm-payment-heading">Payment Summary</Text>
          <Text style={styles.cardRow} testID="order-confirm-order-id">
            Order # {confirmedOrder?.orderId}
          </Text>
          <Text style={styles.cardRow} testID="order-confirm-payment-type">
            Method: {getPaymentTypeLabel(confirmedOrder?.payment_type)}
          </Text>
          <Text style={styles.cardRow} testID="order-confirm-payment-status">
            Payment: {getPaymentStatusLabel(confirmedOrder?.payment_status)}
          </Text>
          {confirmedOrder?.payment_reference ? (
            <Text style={styles.cardRow} testID="order-confirm-payment-reference">
              Reference: {confirmedOrder?.payment_reference}
            </Text>
          ) : null}
          <Text style={styles.cardMessage} testID="order-confirm-payment-message">
            {getPaymentMessage(confirmedOrder)}
          </Text>
        </View>
      ) : (
        <Text style={styles.missingOrderText} testID="order-confirm-empty-state">
          We could not load the payment details for this order.
        </Text>
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
  paymentCard: {
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  cardRow: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 14,
    color: colors.dark,
    marginTop: 8,
  },
  missingOrderText: {
    width: "90%",
    textAlign: "center",
    color: colors.muted,
    marginVertical: 20,
  },
});
