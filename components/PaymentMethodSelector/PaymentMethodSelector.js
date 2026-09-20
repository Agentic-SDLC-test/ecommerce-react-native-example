import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { colors } from "../../constants";
import { PAYMENT_METHODS } from "../../constants/payments";

// Controlled, selectable list of payment methods. The selected method is
// highlighted with a filled radio indicator; pressing a row calls onSelect.
const PaymentMethodSelector = ({ selected, onSelect, testID }) => {
  return (
    <View testID={testID}>
      {PAYMENT_METHODS.map((method) => {
        const isSelected = method.key === selected;
        return (
          <TouchableOpacity
            key={method.key}
            testID={`payment-method-${method.key}`}
            style={styles.row}
            onPress={() => onSelect(method.key)}
          >
            <Ionicons
              name={isSelected ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={isSelected ? colors.primary : colors.muted}
            />
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              testID={`payment-method-${method.key}-label`}
            >
              {method.label}
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
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
    color: colors.dark,
  },
  labelSelected: {
    color: colors.primary,
  },
});
