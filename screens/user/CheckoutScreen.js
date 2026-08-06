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
import React, { useState, useEffect, useRef } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import { colors, payment } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import CustomInput from "../../components/CustomInput";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
import {
  buildCheckoutPayload,
  getPaymentMethodOptions,
} from "../../utils/payment";

const CheckoutScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  const [deliveryCost, setDeliveryCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  // Cash on delivery is pre-selected, so a shopper who reads nothing and taps
  // Submit gets exactly the pre-change behaviour.
  const [paymentMethod, setPaymentMethod] = useState(
    payment.PAYMENT_METHODS.COD
  );
  const [paymentOptions] = useState(getPaymentMethodOptions);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  // Together these guarantee at most one POST /checkout per approved payment:
  // one blocks a concurrent submit, the other blocks a replayed route param.
  const isSubmittingRef = useRef(false);
  const processedReferenceRef = useRef(null);

  const selectedMethodLabel =
    payment.PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod;

  // The card path adds a screen, so say so rather than surprising the shopper.
  // Cash on delivery keeps the original label and the original single tap.
  const submitButtonText =
    paymentMethod === payment.PAYMENT_METHODS.CARD
      ? "Continue to Payment"
      : "Submit Order";

  //method to handle the payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError("");
    console.log("[payment] method_selected", JSON.stringify({ method: method }));
  };

  //method to handle checkout
  const handleCheckout = (paymentResult = null) => {
    if (isSubmittingRef.current) {
      return;
    }

    // The card path needs an outcome before an order can exist, so hand off to
    // the payment screen and come back through the route param.
    if (paymentMethod === payment.PAYMENT_METHODS.CARD && !paymentResult) {
      navigation.navigate("cardpayment", {
        amount: totalCost + deliveryCost,
        returnTo: "checkout",
      });
      return;
    }

    if (
      paymentMethod === payment.PAYMENT_METHODS.CARD &&
      paymentResult.result !== "approved"
    ) {
      setError(paymentResult.message || "Payment was not completed.");
      setAlertType("error");
      return;
    }

    isSubmittingRef.current = true;
    setIsloading(true);
    setError("");

    api
      .checkout(
        buildCheckoutPayload({
          cartItems: cartproduct,
          address: {
            country: country,
            city: city,
            zipcode: zipcode,
            streetAddress: streetAddress,
          },
          paymentMethod: paymentMethod,
          paymentResult: paymentResult,
        })
      ) //API call
      .then((result) => {
        console.log("Checkout=>", result);
        if (result.success == true) {
          console.log(
            "[payment] order_placed",
            JSON.stringify({
              orderId: result.data?.orderId,
              payment_type: result.data?.payment_type,
              payment_status: result.data?.payment_status,
              payment_reference: result.data?.payment_reference,
            })
          );
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          console.log(
            "[payment] order_rejected",
            JSON.stringify({
              payment_type: paymentMethod,
              reason: result.message,
            })
          );
          setIsloading(false);
          isSubmittingRef.current = false;
          setError(
            result.message || "We could not place your order. Please try again."
          );
          setAlertType("error");
        }
      })
      .catch((error) => {
        setIsloading(false);
        isSubmittingRef.current = false;
        setError("We could not place your order. Please try again.");
        setAlertType("error");
        console.log("error", error);
      });
  };

  // consume the outcome the card payment screen navigated back with
  useEffect(() => {
    const paymentResult = route.params?.paymentResult;
    const switchToCod = route.params?.paymentSwitchToCod;

    if (switchToCod) {
      setPaymentMethod(payment.PAYMENT_METHODS.COD);
      setError("Card payment cancelled — your order will be Cash on Delivery.");
      setAlertType("info");
      navigation.setParams({ paymentSwitchToCod: undefined });
      return;
    }

    if (!paymentResult) {
      return;
    }

    if (paymentResult.result === "approved") {
      // The reference is the idempotency key: a re-render or a replayed param
      // cannot place the same order twice.
      if (paymentResult.reference !== processedReferenceRef.current) {
        processedReferenceRef.current = paymentResult.reference;
        handleCheckout(paymentResult);
      }
    } else {
      setError(paymentResult.message || "Payment was not completed.");
      setAlertType(
        paymentResult.result === "declined" ? "error" : "info"
      );
    }

    navigation.setParams({ paymentResult: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.paymentResult, route.params?.paymentSwitchToCod]);

  // set the address and total cost on initital render
  useEffect(() => {
    if (streetAddress && city && country != "") {
      setAddress(`${streetAddress}, ${city},${country}`);
    } else {
      setAddress("");
    }
    setTotalCost(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + object.price * object.quantity;
      }, 0)
    );
  }, []);

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
      <CustomAlert message={error} type={alertType} testID="checkout-alert" />
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
              {country || city || streetAddress != "" ? (
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
        <PaymentMethodSelector
          testID="checkout-payment"
          options={paymentOptions}
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        />
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-method-label">Method</Text>
            <Text style={styles.primaryTextSm} testID="checkout-method-value">{selectedMethodLabel}</Text>
          </View>
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {country && city && streetAddress != "" ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={submitButtonText}
            // onPress={() => navigation.replace("orderconfirm")}
            onPress={() => {
              handleCheckout();
            }}
          />
        ) : (
          <CustomButton testID="checkout-submit-btn" text={submitButtonText} disabled />
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
            {streetAddress || city || country != "" ? (
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
