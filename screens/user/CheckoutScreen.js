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
import React, { useEffect, useMemo, useState } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import {
  getMockOutcomeOptions,
  getPaymentMethodOptions,
  normalizePaymentStatus,
} from "../../utils/payment";

export const buildCheckoutPayload = ({
  cartItems,
  paymentType,
  paymentStatus,
  country,
  city,
  zipcode,
  shippingAddress,
}) => {
  const items = cartItems.map((product) => ({
    productId: product._id,
    price: product.price,
    quantity: product.quantity,
  }));
  const amount = cartItems.reduce((total, product) => {
    return total + parseInt(product.price) * parseInt(product.quantity);
  }, 0);

  return {
    items,
    amount,
    discount: 0,
    payment_type: paymentType,
    payment_status: normalizePaymentStatus(paymentType, paymentStatus),
    country,
    city,
    zipcode,
    shippingAddress,
    status: "pending",
  };
};

export const canSubmitOrder = ({
  country,
  city,
  streetAddress,
  zipcode,
  paymentType,
  paymentStatus,
}) => {
  const hasAddress =
    country.trim() !== "" &&
    city.trim() !== "" &&
    streetAddress.trim() !== "" &&
    zipcode.trim() !== "";

  if (!hasAddress || !paymentType) {
    return false;
  }

  if (paymentType === "wallet_mock" && !paymentStatus) {
    return false;
  }

  return true;
};

const paymentMethodOptions = getPaymentMethodOptions();
const mockOutcomeOptions = getMockOutcomeOptions();

const CheckoutScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  const [deliveryCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [paymentType, setPaymentType] = useState(paymentMethodOptions[0]?.value || "cod");
  const [paymentStatus, setPaymentStatus] = useState("awaiting_payment");

  useEffect(() => {
    if (streetAddress && city && country) {
      setAddress(`${streetAddress}, ${city}, ${country}`);
    } else {
      setAddress("");
    }

    setTotalCost(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + object.price * object.quantity;
      }, 0)
    );
  }, [cartproduct, city, country, streetAddress]);

  const isSubmitEnabled = useMemo(() => {
    return (
      !isloading &&
      canSubmitOrder({
        country,
        city,
        streetAddress,
        zipcode,
        paymentType,
        paymentStatus,
      })
    );
  }, [city, country, isloading, paymentStatus, paymentType, streetAddress, zipcode]);

  const handlePaymentMethodChange = (value) => {
    setPaymentType(value);
    setError("");

    if (value === "wallet_mock") {
      setPaymentStatus(mockOutcomeOptions[0]?.value || "paid");
      return;
    }

    setPaymentStatus("awaiting_payment");
  };

  const handleCheckout = async () => {
    setIsloading(true);
    setError("");
    setAlertType("error");

    try {
      const payload = buildCheckoutPayload({
        cartItems: cartproduct,
        paymentType,
        paymentStatus,
        country,
        city,
        zipcode,
        shippingAddress: streetAddress,
      });
      const result = await api.checkout(payload);

      if (result.success === true) {
        emptyCart("empty");
        navigation.replace("orderconfirm", { order: result.data });
      } else {
        setError(result.message || "Unable to place order");
      }
    } catch (checkoutError) {
      setError(checkoutError?.message || "Unable to place order");
    } finally {
      setIsloading(false);
    }
  };

  const renderOptionCard = ({
    option,
    selectedValue,
    onPress,
    testIDPrefix,
  }) => {
    const isSelected = selectedValue === option.value;
    return (
      <TouchableOpacity
        key={option.value}
        onPress={() => onPress(option.value)}
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        testID={`${testIDPrefix}-${option.value}`}
      >
        <Text
          style={[styles.optionCardText, isSelected && styles.optionCardTextSelected]}
          testID={`${testIDPrefix}-${option.value}-label`}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

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
              key={index}
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
              {address !== "" ? (
                <Text
                  testID="checkout-address-value"
                  style={styles.secondaryTextSm}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {address.length < 25 ? `${address}` : `${address.substring(0, 25)}...`}
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
        <View style={styles.paymentContainer} testID="checkout-payment-options">
          <Text style={styles.paymentLabel} testID="checkout-method-label">
            Choose payment method
          </Text>
          <View style={styles.optionRow}>
            {paymentMethodOptions.map((option) =>
              renderOptionCard({
                option,
                selectedValue: paymentType,
                onPress: handlePaymentMethodChange,
                testIDPrefix: "checkout-payment-method",
              })
            )}
          </View>
          {paymentType === "wallet_mock" && (
            <View style={styles.walletOutcomeContainer} testID="checkout-wallet-outcomes">
              <Text
                style={styles.paymentLabel}
                testID="checkout-demo-payment-heading"
              >
                Demo payment result
              </Text>
              <Text
                style={styles.helperText}
                testID="checkout-demo-payment-helper"
              >
                Choose a mock wallet outcome for checkout demos.
              </Text>
              <View style={styles.optionRow}>
                {mockOutcomeOptions.map((option) =>
                  renderOptionCard({
                    option,
                    selectedValue: paymentStatus,
                    onPress: setPaymentStatus,
                    testIDPrefix: "checkout-payment-status",
                  })
                )}
              </View>
            </View>
          )}
        </View>
        <CustomAlert
          message={error}
          type={alertType}
          testID="checkout-alert"
        />

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        <CustomButton
          testID="checkout-submit-btn"
          text={"Submit Order"}
          disabled={!isSubmitEnabled}
          onPress={handleCheckout}
        />
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
            {streetAddress || city || country || zipcode ? (
              <CustomButton
                testID="checkout-save-address-btn"
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setAddress(`${streetAddress}, ${city}, ${country}`);
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
  paymentContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.muted,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#FFF3ED",
  },
  optionCardText: {
    color: colors.muted,
    fontWeight: "bold",
  },
  optionCardTextSelected: {
    color: colors.primary,
  },
  helperText: {
    color: colors.muted,
    marginBottom: 10,
  },
  walletOutcomeContainer: {
    marginTop: 10,
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
