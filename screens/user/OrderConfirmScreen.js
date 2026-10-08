import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import { displayPayment } from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const { order } = route.params || {};
  const [user, setUser] = useState({});
  const payment = order ? displayPayment(order) : null;

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
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentText} testID="order-confirm-payment-method">
            Payment method: {payment.methodLabel}
          </Text>
          <Text style={styles.paymentText} testID="order-confirm-payment-status">
            Payment status: {payment.statusLabel}
          </Text>
          {order.payment_type === "cod" ? (
            <Text style={styles.paymentText} testID="order-confirm-cod-note">
              Payment is collected on delivery.
            </Text>
          ) : null}
          {order.payment_type === "card" ? (
            <Text style={styles.paymentText} testID="order-confirm-card-note">
              Demo card payment recorded. No real charge was made.
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.paymentText} testID="order-confirm-payment-missing">
          Payment details are unavailable.
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
  paymentBlock: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  paymentText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
});
