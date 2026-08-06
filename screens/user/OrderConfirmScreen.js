import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import * as session from "../../utils/session";
import {
  paymentConfirmationText,
  paymentMethodLabel,
} from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  // Absent when the screen is reached by a legacy navigation or a deep link —
  // the screen then renders exactly its pre-change content rather than
  // inventing a payment state.
  const order = route.params?.order;

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
      {order && (
        <View style={styles.orderCard}>
          <Text style={styles.orderIdText} testID="order-confirm-order-id">
            Order # {order.orderId}
          </Text>
          <Text style={styles.amountText} testID="order-confirm-amount">
            Total {order.amount}$
          </Text>
          <View style={styles.paymentRow}>
            <Text style={styles.methodText} testID="order-confirm-payment-method">
              {paymentMethodLabel(order)}
            </Text>
            <PaymentStatusBadge
              order={order}
              testID="order-confirm-payment-status"
            />
          </View>
          <Text style={styles.messageText} testID="order-confirm-payment-message">
            {paymentConfirmationText(order)}
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
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
    alignSelf: "stretch",
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 5,
  },
  paymentRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  methodText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.muted,
  },
  messageText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 5,
  },
});
