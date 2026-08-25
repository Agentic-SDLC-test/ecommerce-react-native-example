import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { PAYMENT_STATUSES } from "../../constants/payment";

const MOCK_WALLET_BALANCE = 500;

const WalletPaymentScreen = ({ navigation, route }) => {
  const { checkoutPayload, totalCost } = route.params;
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  const handleConfirmPayment = () => {
    setIsloading(true);
    setError("");

    const payload = {
      ...checkoutPayload,
      payment_type: "wallet",
      payment_status: PAYMENT_STATUSES.PAID,
      status: "pending",
    };

    api
      .checkout(payload)
      .then((result) => {
        console.log("Checkout=>", {
          success: result.success,
          payment_type: result.data?.payment_type,
          payment_status: result.data?.payment_status,
        });
        if (result.success === true) {
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          setIsloading(false);
          setError("Unable to place order. Please try again.");
        }
      })
      .catch(() => {
        setIsloading(false);
        setError("Unable to place order. Please try again.");
      });
  };

  const handleCancel = () => {
    navigation.navigate({
      name: "checkout",
      params: { paymentCancelled: true },
      merge: true,
    });
  };

  const handleSimulateFailure = () => {
    navigation.navigate({
      name: "checkout",
      params: { paymentFailed: true },
      merge: true,
    });
  };

  return (
    <View style={styles.container} testID="wallet-payment-screen">
      <StatusBar testID="wallet-payment-status-bar" />
      <ProgressDialog visible={isloading} label={"Processing payment..."} />
      <View style={styles.topBarContainer}>
        <TouchableOpacity testID="wallet-back-btn" onPress={handleCancel}>
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <CustomAlert message={error} type="error" testID="wallet-payment-alert" />
      <ScrollView style={styles.bodyContainer} testID="wallet-payment-scroll">
        <Text style={styles.primaryText} testID="wallet-payment-heading">
          Pay with Wallet
        </Text>
        <View style={styles.walletCard}>
          <Text style={styles.walletTitle} testID="wallet-card-title">
            EasyBuy Wallet
          </Text>
          <Text style={styles.secondaryTextSm} testID="wallet-balance-label">
            Available balance
          </Text>
          <Text style={styles.balanceText} testID="wallet-balance-value">
            ${MOCK_WALLET_BALANCE.toFixed(2)}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.secondaryTextSm} testID="wallet-order-total-label">
            Order total
          </Text>
          <Text style={styles.totalText} testID="wallet-order-total-value">
            ${totalCost}
          </Text>
        </View>
        <CustomButton
          testID="wallet-confirm-btn"
          text={"Confirm Payment"}
          onPress={handleConfirmPayment}
        />
        <TouchableOpacity
          testID="wallet-cancel-btn"
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="wallet-fail-btn"
          style={styles.failButton}
          onPress={handleSimulateFailure}
        >
          <Text style={styles.failText}>Simulate Payment Failure</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 0,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  bodyContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    width: "100%",
  },
  primaryText: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  walletCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  secondaryTextSm: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
  },
  balanceText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light,
    marginVertical: 10,
  },
  totalText: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  cancelButton: {
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  cancelText: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "bold",
  },
  failButton: {
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
  },
  failText: {
    fontSize: 13,
    color: colors.muted,
    textDecorationLine: "underline",
  },
});
