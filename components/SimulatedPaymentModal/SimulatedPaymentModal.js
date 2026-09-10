import { StyleSheet, Modal, Text, View } from "react-native";
import React, { useState } from "react";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { getPaymentMethodLabel } from "../../utils/payment";

// A clearly-marked SIMULATED card-placeholder form. The card fields are never
// validated, never sent, and never stored — they live in local state and are
// discarded when the modal closes. Reuses the Modal + CustomInput + CustomButton
// pattern already used by the address modal in CheckoutScreen.
const SimulatedPaymentModal = ({ visible, method, onPay, onCancel, testID }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  return (
    <Modal
      testID={testID}
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalBody}>
        <View style={styles.modalContainer}>
          <Text style={styles.title} testID="simulated-payment-title">
            {getPaymentMethodLabel(method)}
          </Text>
          <View style={styles.banner}>
            <Text style={styles.bannerText} testID="simulated-payment-banner">
              Simulated — no real payment is taken
            </Text>
          </View>
          <CustomInput
            testID="simulated-payment-card-number"
            value={cardNumber}
            setValue={setCardNumber}
            placeholder={"Card Number"}
            keyboardType={"number-pad"}
          />
          <CustomInput
            testID="simulated-payment-expiry"
            value={expiry}
            setValue={setExpiry}
            placeholder={"MM/YY"}
          />
          <CustomInput
            testID="simulated-payment-cvc"
            value={cvc}
            setValue={setCvc}
            placeholder={"CVC"}
            keyboardType={"number-pad"}
          />
          <CustomButton
            testID="simulated-payment-pay-btn"
            text={"Pay"}
            onPress={() => onPay({ success: true })}
          />
          <CustomButton
            testID="simulated-payment-fail-btn"
            text={"Simulate failure"}
            onPress={() => onPay({ success: false })}
          />
          <CustomButton
            testID="simulated-payment-cancel-btn"
            text={"Cancel"}
            onPress={onCancel}
          />
        </View>
      </View>
    </Modal>
  );
};

export default SimulatedPaymentModal;

const styles = StyleSheet.create({
  modalBody: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 320,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  banner: {
    width: "100%",
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.dark,
    textAlign: "center",
  },
});
