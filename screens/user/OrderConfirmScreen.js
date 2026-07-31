import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, getPaymentMethodLabel } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
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

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">Order has be confirmed</Text>
      {order && (
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentText} testID="order-confirm-method">
            {getPaymentMethodLabel(order.payment_type)}
          </Text>
          <PaymentStatusBadge
            status={order.payment_status}
            testID="order-confirm-payment-status"
          />
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
  paymentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 10,
  },
  paymentText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.muted,
    marginBottom: 6,
  },
});
