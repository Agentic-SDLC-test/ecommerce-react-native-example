import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../../constants";

/**
 * Mutually exclusive COD / Pay with Wallet (Demo) rows for checkout.
 */
const PaymentMethodSelector = ({ value, onChange, testIDPrefix = "checkout-payment" }) => {
  const options = [
    {
      type: "cod",
      label: "Cash On Delivery",
      testID: `${testIDPrefix}-cod`,
    },
    {
      type: "wallet",
      label: "Pay with Wallet (Demo)",
      testID: `${testIDPrefix}-wallet`,
      note: "Demo only — no real money is charged.",
    },
  ];

  return (
    <View style={styles.container} testID={testIDPrefix}>
      {options.map((option) => {
        const selected = value === option.type;
        return (
          <TouchableOpacity
            key={option.type}
            testID={option.testID}
            style={[styles.row, selected && styles.rowSelected]}
            onPress={() => onChange(option.type)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.labelBlock}>
              <Text
                style={[styles.label, selected && styles.labelSelected]}
                testID={`${option.testID}-label`}
              >
                {option.label}
              </Text>
              {option.note ? (
                <Text style={styles.note} testID={`${option.testID}-note`}>
                  {option.note}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentMethodSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  rowSelected: {
    backgroundColor: colors.light,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  labelBlock: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
  },
  labelSelected: {
    color: colors.primary,
  },
  note: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
