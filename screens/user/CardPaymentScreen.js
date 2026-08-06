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
import { colors, payment } from "../../constants";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import {
  SIMULATED_CARD,
  SIMULATION_OUTCOMES,
  simulateCardPayment,
} from "../../utils/paymentSimulator";
import { arePaymentSimControlsEnabled } from "../../utils/payment";

// Runs the simulated card path and returns an outcome to checkout. It never
// places an order — CheckoutScreen stays the single writer, which is what keeps
// a retry from creating a second order.
const CardPaymentScreen = ({ navigation, route }) => {
  const amount = route.params?.amount;
  const returnTo = route.params?.returnTo ?? "checkout";

  const [cardholder, setCardholder] = useState("");
  const [outcome, setOutcome] = useState(SIMULATION_OUTCOMES.APPROVE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  const showSimControls = arePaymentSimControlsEnabled();

  //method to run the simulated payment and hand the outcome back to checkout
  const handlePay = async () => {
    if (isProcessing) {
      return;
    }
    if (!cardholder.trim()) {
      setError("Enter the name on the card.");
      setAlertType("error");
      return;
    }

    setError("");
    setDeclined(false);
    setIsProcessing(true);
    console.log(
      "[payment] simulation_started",
      JSON.stringify({ amount, outcome })
    );

    simulateCardPayment({ amount, outcome })
      .then((paymentResult) => {
        console.log(
          "[payment] simulation_result",
          JSON.stringify({
            result: paymentResult.result,
            reference: paymentResult.reference,
          })
        );
        if (paymentResult.result === "approved") {
          navigation.navigate({
            name: returnTo,
            params: { paymentResult: paymentResult },
            merge: true,
          });
        } else {
          // Stay on the screen so both recovery routes are reachable, and leave
          // the cart alone — no order was created.
          setIsProcessing(false);
          setDeclined(true);
          setError(paymentResult.message);
          setAlertType("error");
        }
      })
      .catch((error) => {
        setIsProcessing(false);
        setError("We could not process the payment. Please try again.");
        setAlertType("error");
        console.log("error", error);
      });
  };

  //method to abandon the card path and continue as cash on delivery
  const handleSwitchToCod = () => {
    navigation.navigate({
      name: returnTo,
      params: { paymentSwitchToCod: true },
      merge: true,
    });
  };

  //method to handle backing out of the payment part-way
  const handleAbandon = () => {
    console.log("[payment] payment_abandoned", JSON.stringify({ amount }));
    navigation.navigate({
      name: returnTo,
      params: {
        paymentResult: {
          result: "not_completed",
          reference: null,
          message: "Payment not completed. Your cart is saved.",
        },
      },
      merge: true,
    });
  };

  return (
    <View style={styles.container} testID="card-payment-screen">
      <StatusBar testID="card-payment-status-bar"></StatusBar>
      <ProgressDialog visible={isProcessing} label={"Processing payment..."} />
      <View style={styles.topBarContainer}>
        <TouchableOpacity testID="card-payment-back-btn" onPress={handleAbandon}>
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
        <View></View>
        <View></View>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.primaryText} testID="card-payment-heading">
          Card Payment
        </Text>
        <Text style={styles.hintText} testID="card-payment-subtitle">
          Simulated payment for review
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="card-payment-alert" />
      <ScrollView style={styles.bodyContainer} testID="card-payment-scroll">
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText} testID="card-payment-notice">
            {payment.SIMULATION_NOTICE}
          </Text>
        </View>

        <Text style={styles.primaryText} testID="card-payment-amount-heading">
          Amount to pay
        </Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm}>Total</Text>
            <Text style={styles.primaryTextSm} testID="card-payment-amount">
              {amount}$
            </Text>
          </View>
        </View>

        <Text style={styles.primaryText} testID="card-payment-card-heading">
          Card
        </Text>
        {/* Read-only text, never a TextInput — there is no field on this screen
            capable of accepting a real card number, expiry or CVC. */}
        <View style={styles.cardPanel}>
          <Text style={styles.cardBrand} testID="card-payment-card-brand">
            {SIMULATED_CARD.brand}
          </Text>
          <Text style={styles.cardNumber} testID="card-payment-card-number">
            {SIMULATED_CARD.number}
          </Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMeta} testID="card-payment-card-expiry">
              Expires {SIMULATED_CARD.expiry}
            </Text>
            <Text style={styles.cardMeta} testID="card-payment-card-cvc">
              CVC {SIMULATED_CARD.cvc}
            </Text>
          </View>
        </View>

        <Text style={styles.secondaryTextSm} testID="card-payment-cardholder-label">
          Name on card
        </Text>
        <CustomInput
          testID="card-payment-cardholder-input"
          value={cardholder}
          setValue={setCardholder}
          placeholder={"Enter the name on the card"}
        />

        {showSimControls && (
          <View testID="card-payment-outcome-controls">
            <Text style={styles.secondaryTextSm}>Simulated outcome</Text>
            <View style={styles.listContainer}>
              <TouchableOpacity
                style={styles.list}
                onPress={() => setOutcome(SIMULATION_OUTCOMES.APPROVE)}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: outcome === SIMULATION_OUTCOMES.APPROVE,
                }}
                accessibilityLabel="Approve the simulated payment"
                testID="card-payment-outcome-approve"
              >
                <Text style={styles.secondaryTextSm}>Approve</Text>
                <Ionicons
                  name={
                    outcome === SIMULATION_OUTCOMES.APPROVE
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color={
                    outcome === SIMULATION_OUTCOMES.APPROVE
                      ? colors.primary
                      : colors.muted
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.list}
                onPress={() => setOutcome(SIMULATION_OUTCOMES.DECLINE)}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: outcome === SIMULATION_OUTCOMES.DECLINE,
                }}
                accessibilityLabel="Decline the simulated payment"
                testID="card-payment-outcome-decline"
              >
                <Text style={styles.secondaryTextSm}>Decline</Text>
                <Ionicons
                  name={
                    outcome === SIMULATION_OUTCOMES.DECLINE
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color={
                    outcome === SIMULATION_OUTCOMES.DECLINE
                      ? colors.primary
                      : colors.muted
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        <CustomButton
          testID="card-payment-pay-btn"
          text={declined ? "Try Again" : `Pay ${amount}$`}
          onPress={handlePay}
        />
        {declined && (
          <CustomButton
            testID="card-payment-switch-cod-btn"
            text={"Use Cash on Delivery instead"}
            onPress={handleSwitchToCod}
          />
        )}
      </View>
    </View>
  );
};

export default CardPaymentScreen;

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
  screenNameContainer: {
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 5,
  },
  bodyContainer: {
    flex: 1,
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
  },
  noticeContainer: {
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.dark,
  },
  cardPanel: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.muted,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginTop: 10,
    marginBottom: 10,
  },
  cardMetaRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMeta: {
    fontSize: 13,
    color: colors.muted,
  },
  primaryText: {
    marginBottom: 5,
    marginTop: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
  hintText: {
    fontSize: 13,
    color: colors.muted,
  },
  list: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: colors.white,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  primaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
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
