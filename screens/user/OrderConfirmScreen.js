import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import { normalizeOrderPayment } from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order;
  const payment = order ? normalizeOrderPayment(order) : null;

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
      {payment && (
        <View style={styles.paymentSummary} testID="order-confirm-payment-summary">
          <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
          <Text style={styles.paymentRow} testID="order-confirm-payment-method">
            Payment method: {payment.methodLabel}
          </Text>
          <Text style={styles.paymentRow} testID="order-confirm-payment-status">
            Payment status: {payment.statusLabel}
          </Text>
          {order?.payment_type === "mock_wallet" && (
            <Text style={styles.paymentNote} testID="order-confirm-payment-note">
              Demo payment only. No real money was charged.
            </Text>
          )}
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
  paymentSummary: {
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  paymentSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.dark,
  },
  paymentRow: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
  paymentNote: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    fontStyle: "italic",
  },
});
