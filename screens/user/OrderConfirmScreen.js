import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});

  //method to get authUser from session
  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  //fetch user data on initial render
  useEffect(() => {
    getUserData();
  }, []);

  const routeParams = route?.params || {};
  const { amount = 0, payment_type = "Cash on Delivery", payment_status = "Pending" } = routeParams;

  let detailsText = "";
  if (payment_type === "Cash on Delivery") {
    detailsText = `Cash On Delivery: Payment of $${amount} pending`;
  } else {
    const methodLabel = (payment_type === "Wallet" || payment_type === "EasyBuy Wallet") ? "Wallet" : "Credit Card";
    detailsText = `Payment of $${amount} completed successfully via ${methodLabel}`;
  }

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">Order has be confirmed</Text>
      <Text style={styles.detailsText} testID="order-confirm-details-text">{detailsText}</Text>
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
    textAlign: "center",
  },
  detailsText: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "500",
    paddingHorizontal: 20,
    textAlign: "center",
    marginVertical: 10,
  },
});
