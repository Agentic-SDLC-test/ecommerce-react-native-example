import { StyleSheet, StatusBar, Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import {
  formatPaymentUpdatedAt,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/payment";

const WalletPaymentScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [currentOrder, setCurrentOrder] = useState(route?.params?.order || null);

  const orderTotal = useMemo(
    () =>
      currentOrder?.amount ||
      currentOrder?.items?.reduce(
        (accumulator, item) =>
          accumulator + Number(item.price) * Number(item.quantity),
        0
      ) ||
      0,
    [currentOrder]
  );

  const handleWalletOutcome = async (nextStatus) => {
    if (!["paid", "failed"].includes(nextStatus) || !currentOrder?._id || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setAlertType("error");

    const payload = {
      payment_status: nextStatus,
    };

    if (nextStatus === "paid") {
      payload.payment_reference = `mock-wallet-${currentOrder.orderId?.toLowerCase?.() || currentOrder._id}`;
    }

    if (nextStatus === "failed") {
      payload.failure_reason = "user_cancelled";
    }

    api
      .updateOrderPaymentStatus(currentOrder._id, payload)
      .then((result) => {
        if (result.success) {
          setCurrentOrder(result.data);
          navigation.replace("orderconfirm", { order: result.data });
          return;
        }

        setAlertType("error");
        setError(result.message || "Unable to update payment status");
      })
      .catch((requestError) => {
        setAlertType("error");
        setError(requestError?.message || "Unable to update payment status");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLeavePending = () => {
    navigation.replace("orderconfirm", { order: currentOrder });
  };

  return (
    <View style={styles.container} testID="wallet-payment-screen">
      <StatusBar testID="wallet-payment-status-bar" />
      <ProgressDialog visible={isLoading} label="Updating payment..." />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="wallet-payment-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText} testID="wallet-payment-heading">
          EasyBuy Wallet
        </Text>
        <Text style={styles.screenNameParagraph} testID="wallet-payment-subtitle">
          Complete or defer your mock digital payment for this order.
        </Text>
      </View>
      <CustomAlert
        message={error}
        type={alertType}
        testID="wallet-payment-alert"
      />
      <View style={styles.summaryCard}>
        <Text style={styles.orderIdText} testID="wallet-payment-order-id">
          Order # {currentOrder?.orderId}
        </Text>
        <Text style={styles.summaryText} testID="wallet-payment-total">
          Total: {orderTotal}$
        </Text>
        <Text style={styles.summaryText} testID="wallet-payment-method">
          Payment method: {getPaymentMethodLabel(currentOrder?.payment_type)}
        </Text>
        <Text style={styles.summaryText} testID="wallet-payment-status">
          Payment state: {getPaymentStatusLabel(currentOrder?.payment_status)}
        </Text>
        <Text style={styles.summaryText} testID="wallet-payment-updated-at">
          Updated: {formatPaymentUpdatedAt(currentOrder?.payment_updated_at)}
        </Text>
      </View>
      <View style={styles.buttonGroup}>
        <CustomButton
          testID="wallet-payment-pay-now-btn"
          text="Pay now"
          disabled={isLoading}
          onPress={() => handleWalletOutcome("paid")}
        />
        <CustomButton
          testID="wallet-payment-fail-btn"
          text="Mark payment failed"
          disabled={isLoading}
          onPress={() => handleWalletOutcome("failed")}
        />
        <CustomButton
          testID="wallet-payment-pending-btn"
          text="Review Later"
          disabled={isLoading}
          onPress={handleLeavePending}
        />
      </View>
    </View>
  );
};

export default WalletPaymentScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 8,
  },
  buttonGroup: {
    width: "100%",
    marginTop: 20,
  },
});
