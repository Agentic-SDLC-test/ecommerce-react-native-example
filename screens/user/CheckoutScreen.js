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
import React, { useState, useEffect } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import {
  colors,
  ENABLE_DIGITAL_PAYMENT,
  PAYMENT_TYPES,
  DEMO_CARD_FAIL_SUFFIX,
  getPaymentMethodLabel,
} from "../../constants";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";

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
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.COD);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  const selectPaymentType = (type) => {
    setPaymentType(type);
    setError("");
    if (type === PAYMENT_TYPES.COD) {
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    }
  };

  const validateDemoCard = () => {
    const numberDigits = String(cardNumber).replace(/\D/g, "");
    if (!numberDigits || !cardExpiry.trim() || !cardCvv.trim()) {
      return { ok: false, message: "Enter demo card number, expiry, and CVV." };
    }
    if (numberDigits.length < 12) {
      return { ok: false, message: "Demo card number must be at least 12 digits." };
    }
    if (numberDigits.endsWith(DEMO_CARD_FAIL_SUFFIX)) {
      return {
        ok: false,
        message: "Demo card payment failed. Try another test card (do not end with 0000).",
      };
    }
    return { ok: true };
  };

  //method to handle checkout
  const handleCheckout = async () => {
    setError("");
    setIsloading(true);

    if (paymentType === PAYMENT_TYPES.CARD) {
      const validation = validateDemoCard();
      if (!validation.ok) {
        console.log("Demo card payment failed", validation.message);
        setAlertType("error");
        setError(validation.message);
        setIsloading(false);
        return;
      }
    }

    var payload = [];
    var totalamount = 0;

    // fetch the cart items from redux and set the total cost
    cartproduct.forEach((product) => {
      let obj = {
        productId: product._id,
        price: product.price,
        quantity: product.quantity,
      };
      totalamount += parseInt(product.price) * parseInt(product.quantity);
      payload.push(obj);
    });

    api
      .checkout({
        items: payload,
        amount: totalamount,
        discount: 0,
        payment_type: paymentType,
        country: country,
        status: "pending",
        city: city,
        zipcode: zipcode,
        shippingAddress: streetAddress,
      }) //API call — never include card fields
      .then((result) => {
        if (result.success == true) {
          const order = result.data;
          console.log("Checkout success", {
            orderId: order?.orderId,
            payment_type: order?.payment_type,
            payment_status: order?.payment_status,
          });
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order });
        } else {
          setIsloading(false);
          setAlertType("error");
          setError(result.message || "Checkout failed");
        }
      })
      .catch((error) => {
        setIsloading(false);
        console.log("error", error);
        setAlertType("error");
        setError("Checkout failed. Please try again.");
      });
  };

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

  const addressReady = country && city && streetAddress != "";
  const cardReady =
    paymentType !== PAYMENT_TYPES.CARD ||
    (String(cardNumber).replace(/\D/g, "").length >= 12 &&
      cardExpiry.trim() &&
      cardCvv.trim());
  const canSubmit = addressReady && cardReady;
  const submitLabel =
    paymentType === PAYMENT_TYPES.CARD
      ? "Pay & Place Order (Demo)"
      : "Submit Order";

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
        <CustomAlert message={error} type={alertType} testID="checkout-payment-alert" />
        <View style={styles.listContainer}>
          <TouchableOpacity
            testID="checkout-payment-cod"
            style={styles.list}
            onPress={() => selectPaymentType(PAYMENT_TYPES.COD)}
          >
            <Text
              style={
                paymentType === PAYMENT_TYPES.COD
                  ? styles.primaryTextSm
                  : styles.secondaryTextSm
              }
              testID="checkout-method-cod-label"
            >
              {getPaymentMethodLabel(PAYMENT_TYPES.COD)}
            </Text>
            {paymentType === PAYMENT_TYPES.COD && (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
          {ENABLE_DIGITAL_PAYMENT && (
            <TouchableOpacity
              testID="checkout-payment-card"
              style={styles.list}
              onPress={() => selectPaymentType(PAYMENT_TYPES.CARD)}
            >
              <Text
                style={
                  paymentType === PAYMENT_TYPES.CARD
                    ? styles.primaryTextSm
                    : styles.secondaryTextSm
                }
                testID="checkout-method-card-label"
              >
                {getPaymentMethodLabel(PAYMENT_TYPES.CARD)}
              </Text>
              {paymentType === PAYMENT_TYPES.CARD && (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {ENABLE_DIGITAL_PAYMENT && paymentType === PAYMENT_TYPES.CARD && (
          <View style={styles.cardDemoContainer} testID="checkout-card-demo">
            <Text style={styles.demoBanner} testID="checkout-demo-banner">
              Demo payment only — no real charge. Use any test card; end with 0000 to simulate failure.
            </Text>
            <CustomInput
              testID="checkout-card-number"
              value={cardNumber}
              setValue={setCardNumber}
              placeholder={"Card Number"}
              keyboardType={"number-pad"}
              maxLength={19}
            />
            <CustomInput
              testID="checkout-card-expiry"
              value={cardExpiry}
              setValue={setCardExpiry}
              placeholder={"Expiry (MM/YY)"}
              maxLength={5}
            />
            <CustomInput
              testID="checkout-card-cvv"
              value={cardCvv}
              setValue={setCardCvv}
              placeholder={"CVV"}
              keyboardType={"number-pad"}
              secureTextEntry={true}
              maxLength={4}
            />
          </View>
        )}

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {canSubmit ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={submitLabel}
            onPress={() => {
              handleCheckout();
            }}
          />
        ) : (
          <CustomButton testID="checkout-submit-btn" text={submitLabel} disabled />
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
  cardDemoContainer: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  demoBanner: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 5,
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
