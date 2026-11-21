import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import PaymentBadge from "../../components/PaymentBadge";

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
          <Text style={styles.orderIdText} testID="order-confirm-order-id">
            Order # {order.orderId}
          </Text>
          <PaymentBadge order={order} testID="order-confirm-payment" />
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
  paymentContainer: {
    alignItems: "center",
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
