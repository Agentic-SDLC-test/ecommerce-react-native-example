import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import { OrderStatus, PaymentType } from "@agentic-sdlc-test/easybuy-api-client/domain";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
import { PAYMENT_METHODS, paymentStatusFor } from "../../utils/payment";
import { simulateCardPayment, isFailingTestCard } from "../../utils/paymentSimulator";

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
  const [paymentType, setPaymentType] = useState(PaymentType.COD);
  // Demo card fields live in component state only; never sent, stored or logged.
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [forceFail, setForceFail] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleSelectMethod = (type) => {
    setPaymentType(type);
    setPaymentError("");
    if (type !== PaymentType.ONLINE) {
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setForceFail(false);
    }
  };

  //method to handle checkout
  const handleCheckout = async () => {
    if (isloading) return;
    setPaymentError("");

    if (
      paymentType === PaymentType.ONLINE &&
      !(cardName && cardNumber && cardExpiry && cardCvc)
    ) {
      setPaymentError("Please fill in the demo card details");
      return;
    }
    setIsloading(true);

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

    if (paymentType === PaymentType.ONLINE) {
      const paymentResult = await simulateCardPayment({
        amount: totalamount,
        forceFail: forceFail || isFailingTestCard(cardNumber),
      });
      console.log("Payment=>", { type: paymentType, success: paymentResult.success });
      if (!paymentResult.success) {
        setIsloading(false);
        setPaymentError(paymentResult.message);
        return;
      }
    }

    api
      .checkout({
        items: payload,
        amount: totalamount,
        discount: 0,
        payment_type: paymentType,
        payment_status: paymentStatusFor(paymentType),
        country: country,
        status: OrderStatus.PENDING,
        city: city,
        zipcode: zipcode,
        shippingAddress: streetAddress,
      }) //API call
      .then((result) => {
        console.log("Checkout=>", result);
        if (result.success == true) {
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          setIsloading(false);
          setPaymentError(result.message || "Could not place the order");
        }
      })
      .catch((error) => {
        setIsloading(false);
        setPaymentError("Could not place the order. Please try again.");
        console.log("error", error);
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

  return (
    <View style={styles.container} testID="checkout-screen">
      <StatusBar testID="checkout-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={paymentType === PaymentType.ONLINE ? "Processing payment..." : "Placing Order..."} />
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
        <View style={styles.listContainer}>
          <PaymentMethodSelector
            testID="checkout-method-selector"
            value={paymentType}
            onChange={handleSelectMethod}
          />
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-method-label">Method</Text>
            <Text style={styles.primaryTextSm} testID="checkout-method-value">
              {PAYMENT_METHODS.find((m) => m.type === paymentType)?.label}
            </Text>
          </View>
          {paymentType === PaymentType.ONLINE && (
            <View testID="checkout-card-form">
              <Text style={styles.demoBanner} testID="checkout-demo-banner">
                Demo only — do not enter real card details
              </Text>
              <CustomInput
                testID="checkout-card-name-input"
                value={cardName}
                setValue={setCardName}
                placeholder={"Name on card"}
              />
              <CustomInput
                testID="checkout-card-number-input"
                value={cardNumber}
                setValue={setCardNumber}
                placeholder={"Card number"}
                keyboardType={"number-pad"}
              />
              <CustomInput
                testID="checkout-card-expiry-input"
                value={cardExpiry}
                setValue={setCardExpiry}
                placeholder={"MM/YY"}
              />
              <CustomInput
                testID="checkout-card-cvc-input"
                value={cardCvc}
                setValue={setCardCvc}
                placeholder={"CVC"}
                keyboardType={"number-pad"}
              />
              <View style={styles.list}>
                <Text style={styles.secondaryTextSm}>Simulate failure (demo)</Text>
                <Switch
                  testID="checkout-simulate-failure-switch"
                  value={forceFail}
                  onValueChange={setForceFail}
                />
              </View>
            </View>
          )}
          {paymentError !== "" && (
            <Text style={styles.paymentError} testID="checkout-payment-error">
              {paymentError}
            </Text>
          )}
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {country && city && streetAddress != "" ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={"Submit Order"}
            // onPress={() => navigation.replace("orderconfirm")}
            onPress={() => {
              handleCheckout();
            }}
          />
        ) : (
          <CustomButton testID="checkout-submit-btn" text={"Submit Order"} disabled />
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
  demoBanner: {
    backgroundColor: colors.warning,
    color: colors.dark,
    fontWeight: "bold",
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  paymentError: {
    color: colors.danger,
    fontWeight: "bold",
    marginTop: 8,
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
