import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const PaymentMethodSelector = ({ options, value, onChange, testID }) => {
  return (
    <View style={styles.listContainer} testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.list}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected }}
            accessibilityLabel={option.label}
            testID={testID ? `${testID}-option-${option.value}` : undefined}
          >
            <View style={styles.optionRow}>
              <Ionicons name={option.icon} size={24} color={colors.muted} />
              <View style={styles.optionTextContainer}>
                <Text
                  style={styles.secondaryTextSm}
                  testID={
                    testID ? `${testID}-option-${option.value}-label` : undefined
                  }
                >
                  {option.label}
                </Text>
                <Text style={styles.hintText}>{option.hint}</Text>
              </View>
            </View>
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={selected ? colors.primary : colors.muted}
              testID={
                testID ? `${testID}-option-${option.value}-radio` : undefined
              }
            />
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
  optionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
  },
  hintText: {
    fontSize: 13,
    color: colors.muted,
  },
});
