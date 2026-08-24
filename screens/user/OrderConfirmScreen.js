import { StyleSheet, Image, Text, View, StatusBar, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import { Ionicons } from "@expo/vector-icons";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route.params?.order || null;

  //method to get authUser from session
  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  //fetch user data on initial render
  useEffect(() => {
    getUserData();
  }, []);

  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const labels = {
      'cod': 'Cash on Delivery',
      'card': 'Credit/Debit Card',
      'wallet': 'Digital Wallet'
    };
    return labels[method] || method;
  };

  // Get payment status color and icon
  const getPaymentStatusStyle = (status) => {
    const styles = {
      'completed': { color: colors.success || '#28a745', icon: 'checkmark-circle' },
      'pending': { color: colors.warning || '#ffc107', icon: 'time' },
      'failed': { color: colors.danger || '#dc3545', icon: 'close-circle' }
    };
    return styles[status] || { color: colors.muted, icon: 'help-circle' };
  };

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageConatiner}>
          <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
        </View>
        <Text style={styles.secondaryText} testID="order-confirm-text">Order has been confirmed</Text>
        
        {order && (
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderIdText} testID="order-confirm-id">Order ID: {order.orderId}</Text>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <View style={styles.listContainer}>
                <View style={styles.list}>
                  <Text style={styles.label} testID="payment-method-label">Payment Method</Text>
                  <Text style={styles.value} testID="payment-method-value">
                    {getPaymentMethodLabel(order.payment_type)}
                  </Text>
                </View>
                <View style={styles.list}>
                  <Text style={styles.label} testID="payment-status-label">Payment Status</Text>
                  <View style={styles.statusContainer}>
                    <Ionicons 
                      name={getPaymentStatusStyle(order.payment_status).icon} 
                      size={20} 
                      color={getPaymentStatusStyle(order.payment_status).color}
                      testID="payment-status-icon"
                    />
                    <Text 
                      style={[styles.statusText, { color: getPaymentStatusStyle(order.payment_status).color }]}
                      testID="payment-status-value"
                    >
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <CustomButton
            testID="order-confirm-home-btn"
            text={"Back to Home"}
            onPress={() => navigation.replace("tab", { user: user })}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderConfirmScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  imageConatiner: {
    width: "100%",
  },
  Image: {
    width: 400,
    height: 300,
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderInfoContainer: {
    width: "90%",
    marginVertical: 20,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.muted,
    textAlign: "center",
    marginBottom: 15,
  },
  infoSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  list: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  label: {
    fontSize: 15,
    color: colors.muted,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.dark,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 5,
  },
  buttonContainer: {
    width: "90%",
    marginTop: 20,
  },
});
