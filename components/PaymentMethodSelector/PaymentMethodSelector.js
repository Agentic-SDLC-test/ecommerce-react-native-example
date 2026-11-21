import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { PAYMENT_METHODS } from "../../utils/payment";

const PaymentMethodSelector = ({ value, onChange, testID }) => {
  return (
    <View testID={testID}>
      {PAYMENT_METHODS.map((method) => {
        const selected = method.type === value;
        return (
          <TouchableOpacity
            key={method.type}
            style={styles.row}
            onPress={() => onChange(method.type)}
            testID={`${testID}-${method.type}`}
          >
            <View>
              <Text style={styles.label}>{method.label}</Text>
              <Text style={styles.description}>{method.description}</Text>
            </View>
            <Ionicons
              name={selected ? "checkmark-circle" : "radio-button-off"}
              size={24}
              color={selected ? colors.primary : colors.muted}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentMethodSelector;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
    paddingVertical: 8,
  },
  label: { fontSize: 15, fontWeight: "bold" },
  description: { fontSize: 12, color: colors.muted },
});
