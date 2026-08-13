import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";

const WalletPaymentModal = ({
  visible,
  amount,
  onClose,
  onSuccess,
  onFailure,
  testID = "wallet-payment-modal",
}) => {
  const handleSimulateFailure = () => {
    onFailure(
      "Payment could not be processed. Please try again or choose another method."
    );
  };

  return (
    <Modal
      testID={testID}
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modelBody}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            testID={`${testID}-close-btn`}
          >
            <Ionicons name="close-circle-outline" size={28} color={colors.muted} />
          </TouchableOpacity>
          <Text style={styles.title} testID={`${testID}-title`}>
            Pay with Wallet (Demo)
          </Text>
          <Text style={styles.disclaimer} testID={`${testID}-disclaimer`}>
            This is a simulated payment — no real money is charged.
          </Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText} testID={`${testID}-balance`}>
              Wallet balance: $500.00 (demo)
            </Text>
            <Text style={styles.amountText} testID={`${testID}-amount`}>
              Amount due: ${amount.toFixed(2)}
            </Text>
          </View>
          <CustomButton
            testID={`${testID}-confirm-btn`}
            text={"Confirm Payment"}
            onPress={onSuccess}
          />
          <TouchableOpacity
            onPress={handleSimulateFailure}
            testID={`${testID}-failure-btn`}
          >
            <Text style={styles.failureLink}>Simulate payment failure</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WalletPaymentModal;

const styles = StyleSheet.create({
  modelBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
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
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    width: "100%",
    backgroundColor: colors.light,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  failureLink: {
    fontSize: 14,
    color: colors.danger,
    textDecorationLine: "underline",
    marginTop: 5,
  },
});
