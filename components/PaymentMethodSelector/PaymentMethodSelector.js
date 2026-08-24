import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange, methods }) => {
  const renderMethodOption = (method) => {
    const isSelected = selectedMethod === method.value;
    
    return (
      <TouchableOpacity
        key={method.value}
        style={styles.methodOption}
        onPress={() => onMethodChange(method.value)}
        testID={`payment-method-${method.value}`}
      >
        <View style={styles.radioContainer}>
          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
        <Text style={styles.methodLabel}>{method.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {methods.map(method => renderMethodOption(method))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  methodLabel: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: '500',
  },
});

export default PaymentMethodSelector;
