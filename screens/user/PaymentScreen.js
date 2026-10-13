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
import CustomInput from "../../components/CustomInput";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import { useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  methodLabel,
  runMockPayment,
} from "../../utils/payment";

// Self-contained digital-payment step. Drives the chosen method to a definite
// outcome: on success the order is created (payment_status = paid) and the user
// is sent to confirmation; on failure no order is created and the user can
// retry or fall back to Cash on Delivery. This keeps a failed/abandoned payment
// from ever producing a "paid" order (BR-5).
const PaymentScreen = ({ navigation, route }) => {
  const { orderPayload, method } = route.params;
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [failed, setFailed] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Place the order through the existing /checkout seam and finish on the
  // confirmation screen. Empties the cart only once the order is created.
  const placeOrder = (payment_type, payment_status) => {
    setIsloading(true);
    api
      .checkout({ ...orderPayload, payment_type, payment_status })
      .then((result) => {
        console.log("Payment outcome", { method: payment_type, payment_status });
        setIsloading(false);
        if (result.success == true) {
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          setAlertType("error");
          setError(result.message || "Unable to place order");
        }
      })
      .catch((err) => {
        setIsloading(false);
        setAlertType("error");
        setError("Unable to place order");
        console.log("error", err);
      });
  };

  // Run the mock payment for the chosen digital method, then persist on success.
  const onPay = async () => {
    setError("");
    setFailed(false);
    if (method === PAYMENT_METHOD.CARD && cardNumber.trim() === "") {
      setAlertType("error");
      setError("Enter your card number to continue");
      return;
    }
    setIsloading(true);
    const result = await runMockPayment(method, { cardNumber, expiry, cvv });
    setIsloading(false);
    if (result.success) {
      placeOrder(method, PAYMENT_STATUS.PAID);
    } else {
      setFailed(true);
      setAlertType("error");
      setError("Payment failed. Retry or pay with Cash on Delivery.");
      console.log("Payment outcome", {
        method,
        payment_status: PAYMENT_STATUS.FAILED,
      });
    }
  };

  // Safe fallback: place the order as Cash on Delivery instead.
  const onFallbackCod = () => {
    setError("");
    placeOrder(PAYMENT_METHOD.COD, PAYMENT_STATUS.COD_PENDING);
  };

  return (
    <View style={styles.container} testID="payment-screen">
      <StatusBar testID="payment-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={"Processing Payment..."} />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="payment-back-btn"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
        <View></View>
        <View></View>
      </View>
      <ScrollView style={styles.bodyContainer} testID="payment-scroll">
        <Text style={styles.primaryText} testID="payment-heading">
          {methodLabel(method)} Payment
        </Text>
        <View style={styles.simulatedBanner}>
          <Text style={styles.simulatedText} testID="payment-simulated-banner">
            Simulated payment — no real money is charged
          </Text>
        </View>
        <CustomAlert message={error} type={alertType} testID="payment-alert" />

        {method === PAYMENT_METHOD.CARD ? (
          <View style={styles.formContainer} testID="payment-card-form">
            <CustomInput
              testID="payment-card-number"
              value={cardNumber}
              setValue={setCardNumber}
              placeholder={"Card Number"}
              keyboardType={"number-pad"}
            />
            <CustomInput
              testID="payment-card-expiry"
              value={expiry}
              setValue={setExpiry}
              placeholder={"Expiry (MM/YY)"}
            />
            <CustomInput
              testID="payment-card-cvv"
              value={cvv}
              setValue={setCvv}
              placeholder={"CVV"}
              keyboardType={"number-pad"}
              secureTextEntry={true}
            />
          </View>
        ) : (
          <View style={styles.formContainer} testID="payment-wallet-form">
            <Text style={styles.secondaryText} testID="payment-wallet-hint">
              Confirm the payment from your mock wallet balance.
            </Text>
          </View>
        )}

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {failed ? (
          <>
            <CustomButton
              testID="payment-retry-btn"
              text={"Retry Payment"}
              onPress={onPay}
            />
            <CustomButton
              testID="payment-cod-fallback-btn"
              text={"Pay with Cash on Delivery"}
              onPress={onFallbackCod}
            />
          </>
        ) : (
          <CustomButton
            testID="payment-pay-btn"
            text={method === PAYMENT_METHOD.WALLET ? "Confirm Wallet Payment" : "Pay Now"}
            onPress={onPay}
          />
        )}
      </View>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    marginBottom: 5,
    marginTop: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
  secondaryText: {
    fontSize: 15,
    color: colors.muted,
  },
  simulatedBanner: {
    backgroundColor: colors.primary_light,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  simulatedText: {
    color: colors.dark,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  buttomContainer: {
    width: "100%",
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  emptyView: {
    width: "100%",
    height: 20,
  },
});
