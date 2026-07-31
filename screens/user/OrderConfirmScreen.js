import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});

  const paymentType = route?.params?.payment_type || "cod";
  const paymentStatus = route?.params?.payment_status || "pending";

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case "card":
        return "Credit/Debit Card";
      case "wallet":
        return "Digital Wallet";
      case "cod":
      default:
        return "Cash on Delivery";
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
      default:
        return "Pending";
    }
  };

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
      <Text style={styles.secondaryText} testID="order-confirm-text">Order has been confirmed</Text>
      
      <View style={styles.paymentInfoContainer}>
        <Text style={styles.paymentInfoText} testID="order-confirm-payment-type">
          Payment Method: {getPaymentTypeLabel(paymentType)}
        </Text>
        <Text style={styles.paymentInfoText} testID="order-confirm-payment-status">
          Payment Status: {getPaymentStatusLabel(paymentStatus)}
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
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  paymentInfoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.muted,
    marginVertical: 4,
  },
});
