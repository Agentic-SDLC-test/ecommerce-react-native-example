import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../constants';

const CardPaymentModal = ({ visible, onClose, onPaymentComplete, amount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateCardNumber = (number) => {
    // Remove spaces and check if it's 16 digits
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length !== 16 || !/^\d+$/.test(cleaned)) {
      return false;
    }
    
    // Simple Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateExpiryDate = (date) => {
    // Format: MM/YY
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(date)) {
      return false;
    }
    
    const [month, year] = date.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    return expiry > now;
  };

  const validateCVV = (cvvValue) => {
    return /^\d{3,4}$/.test(cvvValue);
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    // Validate all fields
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    if (!cardHolder.trim()) {
      Alert.alert('Validation Error', 'Please enter cardholder name');
      return;
    }
    
    if (!validateCardNumber(cleanedCardNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 16-digit card number');
      return;
    }
    
    if (!validateExpiryDate(expiryDate)) {
      Alert.alert('Validation Error', 'Please enter a valid expiry date (MM/YY) in the future');
      return;
    }
    
    if (!validateCVV(cvv)) {
      Alert.alert('Validation Error', 'Please enter a valid 3-4 digit CVV');
      return;
    }

    // Start processing
    setIsProcessing(true);

    // Simulate 2-second payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      
      // Mock payment logic: cards starting with "4" succeed, others fail
      if (cleanedCardNumber.startsWith('4')) {
        onPaymentComplete({ success: true, status: 'completed' });
        resetForm();
      } else {
        onPaymentComplete({ 
          success: false, 
          status: 'failed', 
          message: 'Payment declined. Please try a different card.' 
        });
      }
    }, 2000);
  };

  const resetForm = () => {
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  const isFormValid = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    return (
      cardHolder.trim() !== '' &&
      validateCardNumber(cleanedCardNumber) &&
      validateExpiryDate(expiryDate) &&
      validateCVV(cvv)
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Card Details</Text>
          <Text style={styles.amountText}>Amount: ${amount.toFixed(2)}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              maxLength={19}
              editable={!isProcessing}
              testID="card-number-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={cardHolder}
              onChangeText={setCardHolder}
              editable={!isProcessing}
              testID="cardholder-input"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                keyboardType="numeric"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                maxLength={5}
                editable={!isProcessing}
                testID="expiry-input"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                keyboardType="numeric"
                value={cvv}
                onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 4))}
                maxLength={4}
                secureTextEntry={true}
                editable={!isProcessing}
                testID="cvv-input"
              />
            </View>
          </View>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                testID="cancel-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.payButton,
                  !isFormValid() && styles.payButtonDisabled
                ]}
                onPress={handlePayment}
                disabled={!isFormValid()}
                testID="pay-button"
              >
                <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.dark,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.muted,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.light,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  payButton: {
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  payButtonDisabled: {
    backgroundColor: colors.muted,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CardPaymentModal;
