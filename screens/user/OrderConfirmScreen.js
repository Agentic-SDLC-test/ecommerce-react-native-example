import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import {
  colors,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  resolvePaymentStatus,
} from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order;

  //method to get authUser from session
  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  //fetch user data on initial render
  useEffect(() => {
    getUserData();
  }, []);

  const paymentStatus = order ? resolvePaymentStatus(order) : null;

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.secondaryText} testID="order-confirm-text">
          Order has be confirmed
        </Text>
        {order && (
          <View style={styles.paymentInfo} testID="order-confirm-payment-info">
            <Text style={styles.infoText} testID="order-confirm-order-id">
              Order # {order.orderId}
            </Text>
            <Text style={styles.infoText} testID="order-confirm-payment-method">
              Payment method: {getPaymentMethodLabel(order.payment_type)}
            </Text>
            <Text style={styles.infoText} testID="order-confirm-payment-status">
              Payment status: {getPaymentStatusLabel(paymentStatus)}
            </Text>
          </View>
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
  detailsContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  paymentInfo: {
    marginTop: 15,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 4,
  },
});
