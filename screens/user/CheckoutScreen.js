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
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
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

  const [paymentType, setPaymentType] = useState("cod");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [progressLabel, setProgressLabel] = useState("Placing Order...");

  /**
   * Validate card input formats
   * @returns {boolean} True if all card fields are valid
   */
  const validateCardInputs = () => {
    if (!cardholderName.trim()) return false;
    const cleanCardNumber = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanCardNumber)) return false;
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return false;
    if (!/^\d{3,4}$/.test(cardCVV)) return false;
    return true;
  };

  //method to handle checkout
  const handleCheckout = async () => {
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

    const runCheckoutApi = (pType, pStatus) => {
      api
        .checkout({
          items: payload,
          amount: totalamount,
          discount: 0,
          payment_type: pType,
          payment_status: pStatus,
          country: country,
          status: "pending",
          city: city,
          zipcode: zipcode,
          shippingAddress: streetAddress,
        }) //API call
        .then((result) => {
          console.log("Checkout=>", result);
          if (result.success == true) {
            setIsloading(false);
            emptyCart("empty");
            navigation.replace("orderconfirm", {
              payment_type: pType,
              payment_status: pStatus,
            });
          } else {
            setIsloading(false);
          }
        })
        .catch((error) => {
          setIsloading(false);
          console.log("error", error);
        });
    };

    if (paymentType === "card" || paymentType === "wallet") {
      setProgressLabel("Processing Payment...");
      setTimeout(() => {
        runCheckoutApi(paymentType, "paid");
      }, 1500);
    } else {
      setProgressLabel("Placing Order...");
      runCheckoutApi("cod", "pending");
    }
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
      <ProgressDialog visible={isloading} label={progressLabel} />
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
        <View style={styles.listContainer} testID="checkout-payment-selector">
          <TouchableOpacity
            style={styles.list}
            onPress={() => setPaymentType("cod")}
            testID="checkout-payment-cod-btn"
          >
            <Text style={styles.secondaryTextSm}>Cash on Delivery</Text>
            <Ionicons
              name={paymentType === "cod" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={colors.primary}
              testID="checkout-payment-cod-icon"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.list}
            onPress={() => setPaymentType("card")}
            testID="checkout-payment-card-btn"
          >
            <Text style={styles.secondaryTextSm}>Credit/Debit Card</Text>
            <Ionicons
              name={paymentType === "card" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={colors.primary}
              testID="checkout-payment-card-icon"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.list}
            onPress={() => setPaymentType("wallet")}
            testID="checkout-payment-wallet-btn"
          >
            <Text style={styles.secondaryTextSm}>Digital Wallet</Text>
            <Ionicons
              name={paymentType === "wallet" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={colors.primary}
              testID="checkout-payment-wallet-icon"
            />
          </TouchableOpacity>
        </View>

        {paymentType === "card" && (
          <View style={styles.cardFormContainer} testID="checkout-card-form">
            <View style={styles.disclaimerContainer} testID="checkout-card-disclaimer">
              <Text style={styles.disclaimerText}>
                DEVELOPMENT MODE: Simulating payment only. Do NOT enter real card details.
              </Text>
            </View>
            <CustomInput
              testID="checkout-cardholder-name-input"
              value={cardholderName}
              setValue={setCardholderName}
              placeholder={"Cardholder Name"}
            />
            <CustomInput
              testID="checkout-card-number-input"
              value={cardNumber}
              setValue={(val) => {
                const cleaned = val.replace(/[^0-9]/g, "");
                let formatted = "";
                for (let i = 0; i < cleaned.length && i < 16; i++) {
                  if (i > 0 && i % 4 === 0) {
                    formatted += " ";
                  }
                  formatted += cleaned[i];
                }
                setCardNumber(formatted);
              }}
              placeholder={"Card Number"}
              keyboardType={"number-pad"}
            />
            <View style={styles.cardRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <CustomInput
                  testID="checkout-card-expiry-input"
                  value={cardExpiry}
                  setValue={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, "");
                    let formatted = "";
                    if (cleaned.length > 0) {
                      formatted += cleaned.substring(0, 2);
                    }
                    if (cleaned.length > 2) {
                      formatted += "/" + cleaned.substring(2, 4);
                    }
                    setCardExpiry(formatted);
                  }}
                  placeholder={"MM/YY"}
                  keyboardType={"number-pad"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  testID="checkout-card-cvv-input"
                  value={cardCVV}
                  setValue={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, "").substring(0, 4);
                    setCardCVV(cleaned);
                  }}
                  placeholder={"CVV"}
                  keyboardType={"number-pad"}
                  secureTextEntry={true}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {country && city && streetAddress !== "" && (paymentType !== "card" || validateCardInputs()) ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={"Submit Order"}
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
  cardFormContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  disclaimerContainer: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#ef5350",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  disclaimerText: {
    color: "#c62828",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
