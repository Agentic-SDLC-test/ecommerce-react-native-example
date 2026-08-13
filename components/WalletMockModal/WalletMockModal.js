import { Modal, StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";

/**
 * Client-side wallet payment mock. Success/Fail/Cancel only — no network.
 */
const WalletMockModal = ({ visible, amount, onSuccess, onFail, onCancel }) => {
  return (
    <Modal
      testID="wallet-mock-modal"
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title} testID="wallet-mock-title">
            Pay with Wallet (Demo)
          </Text>
          <Text style={styles.subtitle} testID="wallet-mock-demo-note">
            Demo only — no real money is charged.
          </Text>
          <Text style={styles.amount} testID="wallet-mock-amount">
            Amount: {amount}$
          </Text>
          <CustomButton
            testID="wallet-mock-success-btn"
            text={"Success"}
            onPress={onSuccess}
          />
          <CustomButton
            testID="wallet-mock-fail-btn"
            text={"Fail"}
            onPress={onFail}
          />
          <CustomButton
            testID="wallet-mock-cancel-btn"
            text={"Cancel"}
            onPress={onCancel}
          />
        </View>
      </View>
    </Modal>
  );
};

export default WalletMockModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: 320,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    alignItems: "stretch",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
    textAlign: "center",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
});
