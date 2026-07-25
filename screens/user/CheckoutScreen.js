import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../../constants";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import * as api from "../../api";
import {
  buildCheckoutPayload,
  getCheckoutSubmitLabel,
  hasRequiredShippingAddress,
} from "../../utils/checkoutFlow";
import { getPaymentMethodLabel } from "../../utils/paymentPresentation";
import { isWalletMockEnabled } from "../../utils/featureFlags";

const PAYMENT_OPTIONS = [
  { label: "Cash on Delivery", value: "cod" },
  { label: "Pay with Wallet", value: "wallet" },
];

const CheckoutScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryCost] = useState(0);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("cod");

  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);
  const walletEnabled = isWalletMockEnabled();

  const totalCost = useMemo(
    () =>
      cartproduct.reduce(
        (total, product) => total + Number(product.price) * Number(product.quantity),
        0
      ),
    [cartproduct]
  );

  const addressLabel = useMemo(() => {
    const parts = [streetAddress, city, country].filter(Boolean);
    return parts.join(", ");
  }, [city, country, streetAddress]);

  const addressFields = useMemo(
    () => ({
      country,
      city,
      zipcode,
      shippingAddress: streetAddress,
    }),
    [city, country, streetAddress, zipcode]
  );

  const canSubmit =
    cartproduct.length > 0 &&
    hasRequiredShippingAddress(addressFields) &&
    !isloading &&
    (selectedPaymentType === "cod" || walletEnabled);

  useEffect(() => {
    if (!walletEnabled && selectedPaymentType === "wallet") {
      setSelectedPaymentType("cod");
    }
  }, [selectedPaymentType, walletEnabled]);

  const handleCheckout = async () => {
    if (!canSubmit) {
      return;
    }

    setIsloading(true);
    setError("");

    try {
      const payload = buildCheckoutPayload(
        cartproduct,
        addressFields,
        selectedPaymentType
      );
      const result = await api.checkout(payload);

      if (result?.success) {
        emptyCart("empty");
        if (selectedPaymentType === "wallet" && walletEnabled) {
          navigation.replace("walletpayment", {
            order: result.data,
            origin: "checkout",
          });
        } else {
          navigation.replace("orderconfirm", { order: result.data });
        }
        return;
      }

      setError(result?.message || "Unable to place order");
    } catch (apiError) {
      setError(apiError?.message || "Unable to place order");
    } finally {
      setIsloading(false);
    }
  };

  const handleSaveAddress = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container} testID="checkout-screen">
      <StatusBar testID="checkout-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={"Placing Order..."} />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="checkout-back-btn"
          onPress={() => navigation.goBack()}
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

      <ScrollView
        style={styles.bodyContainer}
        nestedScrollEnabled={true}
        testID="checkout-scroll"
      >
        <Text style={styles.primaryText} testID="checkout-summary-heading">
          Order Summary
        </Text>
        <ScrollView
          style={styles.orderSummaryContainer}
          nestedScrollEnabled={true}
          testID="checkout-summary-scroll"
        >
          {cartproduct.map((product, index) => (
            <BasicProductList
              testID={`checkout-product-${index}`}
              key={`${product._id}-${index}`}
              title={product.title}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </ScrollView>

        <Text style={styles.primaryText} testID="checkout-total-heading">
          Total
        </Text>
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
            <Text style={styles.primaryTextSm} testID="checkout-grand-total-label">
              Total
            </Text>
            <Text
              style={styles.secondaryTextSm}
              testID="checkout-grand-total-value"
            >
              {totalCost + deliveryCost}$
            </Text>
          </View>
        </View>

        <Text style={styles.primaryText} testID="checkout-contact-heading">
          Contact
        </Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-email-label">
              Email
            </Text>
            <Text style={styles.secondaryTextSm} testID="checkout-email-value">
              bukhtyar.haider1@gmail.com
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-phone-label">
              Phone
            </Text>
            <Text style={styles.secondaryTextSm} testID="checkout-phone-value">
              +92 3410988683
            </Text>
          </View>
        </View>

        <Text style={styles.primaryText} testID="checkout-address-heading">
          Address
        </Text>
        <View style={styles.listContainer}>
          <TouchableOpacity
            testID="checkout-address-btn"
            style={styles.list}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.secondaryTextSm} testID="checkout-address-label">
              Address
            </Text>
            <View>
              {addressLabel ? (
                <Text
                  testID="checkout-address-value"
                  style={styles.secondaryTextSm}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {addressLabel.length < 25
                    ? addressLabel
                    : `${addressLabel.substring(0, 25)}...`}
                </Text>
              ) : (
                <Text style={styles.primaryTextSm} testID="checkout-address-add">
                  Add
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.primaryText} testID="checkout-payment-heading">
          Payment
        </Text>
        <View style={styles.listContainer}>
          {PAYMENT_OPTIONS.filter(
            (option) => option.value === "cod" || walletEnabled
          ).map((option) => {
            const selected = selectedPaymentType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
                onPress={() => setSelectedPaymentType(option.value)}
                testID={`checkout-payment-${option.value}`}
              >
                <View>
                  <Text style={styles.secondaryTextSm}>
                    {getPaymentMethodLabel(option.value)}
                  </Text>
                  <Text style={styles.paymentHelperText}>
                    {option.value === "wallet"
                      ? "Create the order now and finish the mock wallet step next."
                      : "Pay when your order is delivered."}
                  </Text>
                </View>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected && <View style={styles.radioInner}></View>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>

      <View style={styles.buttomContainer}>
        <CustomButton
          testID="checkout-submit-btn"
          text={getCheckoutSubmitLabel(selectedPaymentType)}
          disabled={!canSubmit}
          onPress={handleCheckout}
        />
      </View>

      <Modal
        testID="checkout-address-modal"
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
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
            />
            <CustomButton
              testID="checkout-save-address-btn"
              onPress={handleSaveAddress}
              text={
                hasRequiredShippingAddress(addressFields)
                  ? "save"
                  : "close"
              }
            />
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
  bodyContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    width: "100%",
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
    minHeight: 50,
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
    minHeight: 400,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: colors.shadow,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.info,
  },
  paymentHelperText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.shadow,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
