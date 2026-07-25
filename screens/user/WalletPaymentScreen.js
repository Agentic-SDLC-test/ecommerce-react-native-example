import { StyleSheet, StatusBar, Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import { getPaymentMethodLabel } from "../../utils/paymentPresentation";

const WalletPaymentScreen = ({ navigation, route }) => {
  const initialOrder = route?.params?.order || null;
  const [order, setOrder] = useState(initialOrder);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  const amountLabel = useMemo(() => `${Number(order?.amount || 0).toFixed(2)}$`, [order]);

  const handleResolvePayment = async (nextStatus) => {
    if (!order?._id || isloading) {
      return;
    }

    setIsloading(true);
    setError("");
    setAlertType("error");

    try {
      const result = await api.updateOrderPaymentStatus(order._id, nextStatus);

      if (result?.success) {
        setOrder(result.data);
        navigation.replace("orderconfirm", { order: result.data });
        return;
      }

      setError(result?.message || "Unable to update wallet payment status");
    } catch (apiError) {
      setError(apiError?.message || "Unable to update wallet payment status");
    } finally {
      setIsloading(false);
    }
  };

  const handleLeavePending = () => {
    navigation.replace("orderconfirm", { order });
  };

  return (
    <View style={styles.container} testID="wallet-payment-screen">
      <ProgressDialog visible={isloading} label={"Updating payment..."} />
      <StatusBar testID="wallet-payment-status-bar"></StatusBar>
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

      <View style={styles.content}>
        <Text style={styles.heading} testID="wallet-payment-heading">
          Wallet Payment
        </Text>
        <Text style={styles.subheading} testID="wallet-payment-subtitle">
          This is a mock wallet flow. Your order already exists and will keep its payment state.
        </Text>

        <CustomAlert
          message={error}
          type={alertType}
          testID="wallet-payment-alert"
        />

        <View style={styles.card}>
          <Text style={styles.label} testID="wallet-payment-order-id-label">
            Order ID
          </Text>
          <Text style={styles.value} testID="wallet-payment-order-id-value">
            {order?.orderId || "--"}
          </Text>

          <Text style={styles.label} testID="wallet-payment-method-label">
            Payment method
          </Text>
          <Text style={styles.value} testID="wallet-payment-method-value">
            {getPaymentMethodLabel(order?.payment_type)}
          </Text>

          <Text style={styles.label} testID="wallet-payment-total-label">
            Order total
          </Text>
          <Text style={styles.value} testID="wallet-payment-total-value">
            {amountLabel}
          </Text>

          <Text style={styles.label} testID="wallet-payment-status-label">
            Current payment status
          </Text>
          <PaymentStatusBadge
            paymentStatus={order?.payment_status}
            paymentType={order?.payment_type}
            testID="wallet-payment-status-badge"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <CustomButton
          text={"Mark Paid"}
          onPress={() => handleResolvePayment("paid")}
          disabled={isloading}
          testID="wallet-payment-mark-paid-btn"
        />
        <CustomButton
          text={"Fail Payment"}
          onPress={() => handleResolvePayment("failed")}
          disabled={isloading}
          testID="wallet-payment-fail-btn"
        />
        <CustomButton
          text={"Cancel Payment"}
          onPress={() => handleResolvePayment("cancelled")}
          disabled={isloading}
          testID="wallet-payment-cancel-btn"
        />
        <TouchableOpacity
          onPress={handleLeavePending}
          disabled={isloading}
          testID="wallet-payment-leave-pending-btn"
        >
          <Text style={styles.pendingLink}>Leave as pending payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
  },
  actions: {
    width: "100%",
    paddingBottom: 20,
  },
  pendingLink: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "700",
    marginTop: 6,
  },
});
