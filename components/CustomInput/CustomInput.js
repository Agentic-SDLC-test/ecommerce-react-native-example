import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../../constants";

const CustomInput = ({
  value,
  setValue,
  placeholder,
  secureTextEntry,
  placeholderTextColor,
  onFocus,
  radius,
  width = "100%",
  keyboardType,
  maxLength,
  multiline = false,
  testID,
}) => {
  return (
    <View style={{ width: width }} testID={testID ? `${testID}-wrapper` : undefined}>
      <TextInput
        placeholder={placeholder}
        onChangeText={setValue}
        value={value}
        secureTextEntry={secureTextEntry}
        style={[styles.CustomInput, multiline && styles.CustomInputMultiline]}
        placeholderTextColor={placeholderTextColor}
        onFocus={onFocus}
        borderRadius={radius}
        maxLength={maxLength}
        keyboardType={keyboardType}
        multiline={multiline}
        testID={testID}
      />
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  CustomInput: {
    height: 40,
    marginBottom: 10,
    marginTop: 10,
    width: "100%",
    padding: 5,
    backgroundColor: colors.white,
    elevation: 5,
    paddingHorizontal: 20,
  },
  // Opt-in only, so every existing single-line caller is unaffected.
  CustomInputMultiline: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: "top",
  },
});
