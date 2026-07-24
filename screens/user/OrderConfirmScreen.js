import { StyleSheet, Image, Text, View, StatusBar, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import ProgressDialog from "react-native-progress-dialog";
import * as api from "../../api";
import * as orderPayment from "../../utils/orderPayment";

const resolvableStatuses = ["awaiting_payment", "payment_issue"];

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const [order, setOrder] = useState(route?.params?.order || {});
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [isloading, setIsloading] = useState(false);

  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  useEffect(() => {
    getUserData();
  }, []);

  const paymentStatus = orderPayment.derivePaymentStatus(order);
  const showResolveActions =
    orderPayment.canResolveDemoPayment(order) &&
    resolvableStatuses.includes(paymentStatus);

  const handleResolvePayment = (nextStatus) => {
    setIsloading(true);
    setFeedback("");

    api
      .updateOrderPaymentStatus(order?._id, { payment_status: nextStatus })
      .then((result) => {
        if (result.success) {
          setOrder(result.data);
          setFeedbackType("success");
          setFeedback(
            `Payment status updated to ${orderPayment.getPaymentStatusLabel(
              result.data?.payment_status
            )}`
          );
        } else {
          setFeedbackType("error");
          setFeedback(result.message || "Unable to update payment status");
        }
        setIsloading(false);
      })
      .catch((requestError) => {
        setFeedbackType("error");
        setFeedback(requestError.message || "Unable to update payment status");
        setIsloading(false);
      });
  };

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <ProgressDialog visible={isloading} label={"Updating payment..."} />
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="order-confirm-scroll"
      >
        <View style={styles.imageConatiner}>
          <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
        </View>
        <Text style={styles.secondaryText} testID="order-confirm-text">Order has be confirmed</Text>
        <Text style={styles.orderNumber} testID="order-confirm-order-number">
          Order # {order?.orderId}
        </Text>
        <View style={styles.summaryCard} testID="order-confirm-payment-summary">
          <Text style={styles.summaryHeading}>Payment summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Method</Text>
            <Text testID="order-confirm-payment-method">
              {orderPayment.getPaymentMethodLabel(order?.payment_type)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text testID="order-confirm-payment-status">
              {orderPayment.getPaymentStatusLabel(paymentStatus)}
            </Text>
          </View>
          {orderPayment.getPaymentDisclaimer(order) && (
            <Text style={styles.disclaimer} testID="order-confirm-payment-disclaimer">
              {orderPayment.getPaymentDisclaimer(order)}
            </Text>
          )}
          {feedback ? (
            <Text
              style={feedbackType === "error" ? styles.feedbackError : styles.feedbackSuccess}
              testID="order-confirm-feedback"
            >
              {feedback}
            </Text>
          ) : null}
        </View>
        {showResolveActions && (
          <View style={styles.actionsContainer} testID="order-confirm-payment-actions">
            <CustomButton
              testID="order-confirm-mark-paid-btn"
              text={"Mark as paid"}
              disabled={isloading}
              onPress={() => handleResolvePayment("paid")}
            />
            <CustomButton
              testID="order-confirm-mark-issue-btn"
              text={"Mark as payment issue"}
              disabled={isloading}
              onPress={() => handleResolvePayment("payment_issue")}
            />
          </View>
        )}
        <CustomButton
          testID="order-confirm-home-btn"
          text={"Back to Home"}
          onPress={() => navigation.replace("tab", { user: user })}
        />
      </ScrollView>
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
    justifyContent: "center",
    paddingBottom: 40,
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 30,
    paddingHorizontal: 20,
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
    fontSize: 20,
    fontWeight: "bold",
  },
  orderNumber: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 15,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    color: colors.muted,
    fontWeight: "bold",
  },
  disclaimer: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 13,
  },
  feedbackSuccess: {
    marginTop: 12,
    color: "green",
    fontWeight: "bold",
  },
  feedbackError: {
    marginTop: 12,
    color: "red",
    fontWeight: "bold",
  },
  actionsContainer: {
    width: "100%",
    marginBottom: 10,
  },
});
