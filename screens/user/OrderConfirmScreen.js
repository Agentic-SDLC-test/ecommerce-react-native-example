import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import {
  formatPaymentUpdatedAt,
  getOrderConfirmationCopy,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order || {};
  const confirmationCopy = getOrderConfirmationCopy(order?.payment_status);

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
        <Image
          source={SuccessImage}
          style={styles.Image}
          testID="order-confirm-image"
        />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">
        {confirmationCopy.heading}
      </Text>
      <Text style={styles.descriptionText} testID="order-confirm-description">
        {confirmationCopy.message}
      </Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText} testID="order-confirm-order-id">
          Order # {order?.orderId || "Pending"}
        </Text>
        <Text style={styles.summaryText} testID="order-confirm-method">
          Payment method: {getPaymentMethodLabel(order?.payment_type)}
        </Text>
        <Text style={styles.summaryText} testID="order-confirm-payment-status">
          Payment state: {getPaymentStatusLabel(order?.payment_status)}
        </Text>
        <Text style={styles.summaryText} testID="order-confirm-payment-updated-at">
          Last payment update: {formatPaymentUpdatedAt(order?.payment_updated_at)}
        </Text>
        {order?.payment_failure_reason ? (
          <Text style={styles.summaryText} testID="order-confirm-payment-failure">
            Failure reason: {order.payment_failure_reason}
          </Text>
        ) : null}
      </View>
      <View style={styles.buttonContainer}>
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
    paddingHorizontal: 20,
    flex: 1,
  },
  imageConatiner: {
    width: "100%",
    alignItems: "center",
  },
  Image: {
    width: 320,
    height: 240,
  },
  secondaryText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.dark,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  summaryText: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
});
