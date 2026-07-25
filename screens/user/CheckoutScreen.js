import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { buildCheckoutPayload } from "../../utils/checkout";
import {
  getPaymentMethodLabel,
  isMockWalletEnabled,
} from "../../utils/payment";

const CheckoutScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("cod");
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);
  const walletEnabled = isMockWalletEnabled();
  const hasAddress = Boolean(country && city && streetAddress && zipcode);
  const canSubmit = hasAddress && cartproduct.length > 0 && !isloading;

  const handleCheckout = () => {
    if (!canSubmit) {
      return;
    }

    setIsloading(true);
    setError("");

    api
      .checkout(
        buildCheckoutPayload(
          cartproduct,
          {
            country,
            city,
            zipcode,
            shippingAddress: streetAddress,
          },
          selectedPaymentType
        )
      )
      .then((result) => {
        if (result.success === true) {
          emptyCart("empty");
          if (selectedPaymentType === "wallet") {
            navigation.replace("walletpayment", { order: result.data });
          } else {
            navigation.replace("orderconfirm", { order: result.data });
          }
          return;
        }

        setError(result.message || "Unable to place order");
      })
      .catch((requestError) => {
        setError(requestError?.message || "Unable to place order");
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  useEffect(() => {
    if (hasAddress) {
      setAddress(`${streetAddress}, ${city}, ${country}`);
    } else {
      setAddress("");
    }

    setTotalCost(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + Number(object.price) * Number(object.quantity);
      }, 0)
    );
  }, [cartproduct, city, country, hasAddress, streetAddress, zipcode]);

  return (
    <View style={styles.container} testID="checkout-screen">
      <StatusBar testID="checkout-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={"Placing Order..."} />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="checkout-back-btn"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
        <View></View>
        <View></View>
      </View>
      <CustomAlert message={error} type="error" testID="checkout-alert" />
      <ScrollView style={styles.bodyContainer} nestedScrollEnabled={true} testID="checkout-scroll">
        <Text style={styles.primaryText} testID="checkout-summary-heading">Order Summary</Text>
        <ScrollView
          style={styles.orderSummaryContainer}
          nestedScrollEnabled={true}
          testID="checkout-summary-scroll"
        >
          {cartproduct.map((product, index) => (
            <BasicProductList
              testID={`checkout-product-${index}`}
              key={index}
              title={product.title}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </ScrollView>
        <Text style={styles.primaryText} testID="checkout-total-heading">Total</Text>
        <View style={styles.totalOrderInfoContainer}>
          <View style={styles.list}>
            <Text testID="checkout-order-label">Order</Text>
            <Text testID="checkout-order-value">{totalCost}$</Text>
          </View>
          <View style={styles.list}>
            <Text testID="checkout-delivery-label">Delivery</Text>
            <Text testID="checkout-delivery-value">{deliveryCost}$</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.primaryTextSm} testID="checkout-grand-total-label">Total</Text>
            <Text style={styles.secondaryTextSm} testID="checkout-grand-total-value">
              {totalCost + deliveryCost}$
            </Text>
          </View>
        </View>
        <Text style={styles.primaryText} testID="checkout-contact-heading">Contact</Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-email-label">Email</Text>
            <Text style={styles.secondaryTextSm} testID="checkout-email-value">
              bukhtyar.haider1@gmail.com
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-phone-label">Phone</Text>
            <Text style={styles.secondaryTextSm} testID="checkout-phone-value">+92 3410988683</Text>
          </View>
        </View>
        <Text style={styles.primaryText} testID="checkout-address-heading">Address</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity
            testID="checkout-address-btn"
            style={styles.list}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.secondaryTextSm} testID="checkout-address-label">Address</Text>
            <View>
              {address ? (
                <Text
                  testID="checkout-address-value"
                  style={styles.secondaryTextSm}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {address.length < 25
                    ? `${address}`
                    : `${address.substring(0, 25)}...`}
                </Text>
              ) : (
                <Text style={styles.primaryTextSm} testID="checkout-address-add">Add</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.primaryText} testID="checkout-payment-heading">Payment</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentType === "cod" && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPaymentType("cod")}
            testID="checkout-payment-cod-option"
          >
            <View>
              <Text style={styles.secondaryTextSm} testID="checkout-method-label">
                {getPaymentMethodLabel("cod")}
              </Text>
              <Text style={styles.paymentOptionHint}>Pay when your order arrives.</Text>
            </View>
            <Text style={styles.paymentSelectedText}>
              {selectedPaymentType === "cod" ? "Selected" : "Select"}
            </Text>
          </TouchableOpacity>
          {walletEnabled ? (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentType === "wallet" && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPaymentType("wallet")}
              testID="checkout-payment-wallet-option"
            >
              <View>
                <Text
                  style={styles.secondaryTextSm}
                  testID="checkout-wallet-method-label"
                >
                  {getPaymentMethodLabel("wallet")}
                </Text>
                <Text style={styles.paymentOptionHint}>
                  Complete a mocked wallet payment after order creation.
                </Text>
              </View>
              <Text style={styles.paymentSelectedText}>
                {selectedPaymentType === "wallet" ? "Selected" : "Select"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {canSubmit ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={selectedPaymentType === "wallet" ? "Continue to Payment" : "Submit Order"}
            onPress={handleCheckout}
          />
        ) : (
          <CustomButton
            testID="checkout-submit-btn"
            text={selectedPaymentType === "wallet" ? "Continue to Payment" : "Submit Order"}
            disabled
          />
        )}
      </View>
      <Modal
        testID="checkout-address-modal"
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.modelAddressContainer}>
            <CustomInput
              testID="checkout-country-input"
              value={country}
              setValue={setCountry}
              placeholder={"Enter Country"}
            />
            <CustomInput
              testID="checkout-city-input"
              value={city}
              setValue={setCity}
              placeholder={"Enter City"}
            />
            <CustomInput
              testID="checkout-street-input"
              value={streetAddress}
              setValue={setStreetAddress}
              placeholder={"Enter Street Address"}
            />
            <CustomInput
              testID="checkout-zipcode-input"
              value={zipcode}
              setValue={setZipcode}
              placeholder={"Enter ZipCode"}
              keyboardType={"number-pad"}
            />
            {hasAddress ? (
              <CustomButton
                testID="checkout-save-address-btn"
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setAddress(`${streetAddress}, ${city},${country}`);
                }}
                text={"save"}
              />
            ) : (
              <CustomButton
                testID="checkout-close-modal-btn"
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                text={"close"}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 0,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  toBarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bodyContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  orderSummaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    maxHeight: 220,
  },
  totalOrderInfoContainer: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.white,
  },
  primaryText: {
    marginBottom: 5,
    marginTop: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: colors.white,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  primaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    minHeight: 65,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  paymentOptionSelected: {
    backgroundColor: colors.primary_light,
    borderRadius: 10,
  },
  paymentOptionHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
    maxWidth: 220,
  },
  paymentSelectedText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  buttomContainer: {
    width: "100%",
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  emptyView: {
    width: "100%",
    height: 20,
  },
  modelBody: {
    flex: 1,
    display: "flex",
    flexL: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modelAddressContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 320,
    height: 400,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
});
