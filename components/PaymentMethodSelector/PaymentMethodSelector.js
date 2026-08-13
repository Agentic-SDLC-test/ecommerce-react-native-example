import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { PAYMENT_METHODS } from "../../constants/payment";

const OPTIONS = [
  {
    value: PAYMENT_METHODS.COD,
    label: "Cash on Delivery",
    subtitle: null,
  },
  {
    value: PAYMENT_METHODS.WALLET,
    label: "Digital Wallet",
    subtitle: "Simulated demo payment",
  },
];

const PaymentMethodSelector = ({
  selectedMethod,
  onSelect,
  testID = "payment-method-selector",
}) => {
  return (
    <View style={styles.listContainer} testID={testID}>
      {OPTIONS.map((option) => {
        const isSelected = selectedMethod === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionRow, isSelected && styles.optionRowSelected]}
            onPress={() => onSelect(option.value)}
            testID={`${testID}-${option.value}`}
          >
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.subtitle ? (
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              ) : null}
            </View>
            {isSelected ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primary}
              />
            ) : (
              <Ionicons
                name="ellipse-outline"
                size={22}
                color={colors.muted}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentMethodSelector;

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  optionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionRowSelected: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderBottomColor: colors.primary,
  },
  optionContent: {
    flex: 1,
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
