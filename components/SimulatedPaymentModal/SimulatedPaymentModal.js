import { StyleSheet, Text, View, Modal } from "react-native";
import React, { useState } from "react";
import { colors, PAYMENT_STATUSES } from "../../constants";
import CustomInput from "../CustomInput";
import CustomButton from "../CustomButton";

// Clearly-labeled, client-only simulated card-entry step. No processor is
// contacted and NO card data ever leaves this component: cardNumber / expiry /
// cvv live in local state only, are never passed to onResult, never logged,
// and never sent to the API. The parent decides what to do with the returned
// outcome (PAID / FAILED).
const SimulatedPaymentModal = ({ visible, amount, onResult, onCancel, testID }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Clear the placeholder inputs so a re-opened modal starts fresh; the values
  // are intentionally not included in the outcome handed back to the parent.
  const clearCardFields = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleResult = (outcome) => {
    clearCardFields();
    onResult(outcome);
  };

  const handleCancel = () => {
    clearCardFields();
    onCancel();
  };

  return (
    <Modal
      testID={testID}
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalBody}>
        <View style={styles.modalContainer}>
          <View style={styles.banner} testID={testID ? `${testID}-banner` : undefined}>
            <Text style={styles.bannerText}>
              Simulated payment — no real charge. Do not enter real card details.
            </Text>
          </View>
          <CustomInput
            testID={testID ? `${testID}-card-input` : undefined}
            value={cardNumber}
            setValue={setCardNumber}
            placeholder={"4242 4242 4242 4242"}
            keyboardType={"number-pad"}
          />
          <CustomInput
            testID={testID ? `${testID}-expiry-input` : undefined}
            value={expiry}
            setValue={setExpiry}
            placeholder={"MM/YY"}
          />
          <CustomInput
            testID={testID ? `${testID}-cvv-input` : undefined}
            value={cvv}
            setValue={setCvv}
            placeholder={"CVV"}
            keyboardType={"number-pad"}
            secureTextEntry={true}
          />
          <CustomButton
            testID={testID ? `${testID}-pay-btn` : undefined}
            text={`Pay $${amount} (Simulated)`}
            onPress={() => handleResult(PAYMENT_STATUSES.PAID)}
          />
          <CustomButton
            testID={testID ? `${testID}-fail-btn` : undefined}
            text={"Simulate Failure"}
            onPress={() => handleResult(PAYMENT_STATUSES.FAILED)}
          />
          <CustomButton
            testID={testID ? `${testID}-cancel-btn` : undefined}
            text={"Cancel"}
            onPress={handleCancel}
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
  banner: {
    width: "100%",
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  bannerText: {
    color: colors.dark,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
});
