import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  PAYMENT_TYPES,
  DIGITAL_PAYMENT_ENABLED,
  getPaymentMethodLabel,
} from "../../constants";

// Lets the shopper pick between Cash On Delivery and the simulated Card
// method on the checkout screen. COD is always shown; the Card row appears
// only when the DIGITAL_PAYMENT_ENABLED rollback flag is on. The selected
// row is highlighted with the brand primary color.
const PaymentMethodSelector = ({ selected, onSelect, testID }) => {
  const options = [PAYMENT_TYPES.COD];
  if (DIGITAL_PAYMENT_ENABLED) {
    options.push(PAYMENT_TYPES.CARD);
  }

  return (
    <View testID={testID}>
      {options.map((type) => {
        const isSelected = selected === type;
        return (
          <TouchableOpacity
            key={type}
            testID={testID ? `${testID}-${type}` : undefined}
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onSelect(type)}
          >
            <Ionicons
              name={isSelected ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={isSelected ? colors.primary : colors.muted}
            />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {getPaymentMethodLabel(type)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentMethodSelector;

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  rowSelected: {
    borderBottomColor: colors.primary,
  },
  label: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "bold",
    color: colors.muted,
  },
  labelSelected: {
    color: colors.primary,
  },
});
