import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
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

  // Payment states
  const [paymentType, setPaymentType] = useState("Cash on Delivery");
  const [cardDetails, setCardDetails] = useState({
    card_number: "",
    cardholder_name: "",
    expiry: "",
    cvv: "",
  });
  const [walletVerified, setWalletVerified] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  // States for CC input modal
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [cardholderNameInput, setCardholderNameInput] = useState("");
  const [cardExpiryInput, setCardExpiryInput] = useState("");
  const [cardCvvInput, setCardCvvInput] = useState("");

  const isCardValid =
    cardDetails.card_number.length === 16 &&
    /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardDetails.expiry) &&
    cardDetails.cvv.length === 3 &&
    cardDetails.cardholder_name.trim().length > 0;

  const isAddressValid = country && city && streetAddress != "";
  const isPaymentValid =
    paymentType === "Cash on Delivery" ||
    (paymentType === "Debit/Credit Card" && isCardValid) ||
    (paymentType === "EasyBuy Wallet" && walletVerified);

  const canSubmit = isAddressValid && isPaymentValid;

  const handleWalletVerify = async () => {
    setWalletLoading(true);
    setTimeout(() => {
      api.getWalletBalance()
        .then((res) => {
          if (res.success) {
            setWalletBalance(res.balance);
            setWalletVerified(true);
          } else {
            alert("Failed to fetch wallet balance.");
          }
        })
        .catch((err) => {
          console.log("Wallet fetch error", err);
          alert("Error verifying wallet.");
        })
        .finally(() => {
          setWalletLoading(false);
        });
    }, 800);
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
        card_details: paymentType === "Debit/Credit Card" ? cardDetails : undefined,
      }) //API call
      .then((result) => {
        console.log("Checkout=>", result);
        if (result.success == true) {
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", {
            amount: totalamount,
            payment_type: paymentType,
            payment_status: result.data ? result.data.payment_status : (paymentType === "Cash on Delivery" ? "Pending" : "Paid"),
          });
        } else {
          setIsloading(false);
          alert(result.message || "Failed to place order");
        }
      })
      .catch((error) => {
        setIsloading(false);
        console.log("error", error);
        alert(error.message || "An error occurred during checkout");
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
        <View style={styles.paymentSelectionContainer}>
          {/* COD Tab */}
          <TouchableOpacity
            testID="checkout-payment-cod"
            style={[
              styles.paymentTab,
              paymentType === "Cash on Delivery" && styles.paymentTabSelected,
            ]}
            onPress={() => setPaymentType("Cash on Delivery")}
          >
            <View style={styles.paymentTabRow}>
              <Ionicons
                name={paymentType === "Cash on Delivery" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={paymentType === "Cash on Delivery" ? colors.primary : colors.muted}
              />
              <Text style={styles.paymentTabText}>Cash On Delivery (COD)</Text>
            </View>
          </TouchableOpacity>

          {/* Card Tab */}
          <TouchableOpacity
            testID="checkout-payment-card"
            style={[
              styles.paymentTab,
              paymentType === "Debit/Credit Card" && styles.paymentTabSelected,
            ]}
            onPress={() => {
              setPaymentType("Debit/Credit Card");
              setCardModalVisible(true);
            }}
          >
            <View style={styles.paymentTabRow}>
              <Ionicons
                name={paymentType === "Debit/Credit Card" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={paymentType === "Debit/Credit Card" ? colors.primary : colors.muted}
              />
              <Text style={styles.paymentTabText}>Debit/Credit Card</Text>
            </View>
            {paymentType === "Debit/Credit Card" && isCardValid && (
              <Text style={styles.paymentSubtext} testID="checkout-card-saved-indicator">
                Card: **** **** **** {cardDetails.card_number.slice(-4)}
              </Text>
            )}
            {paymentType === "Debit/Credit Card" && !isCardValid && (
              <Text style={[styles.paymentSubtext, { color: "red" }]} testID="checkout-card-invalid-indicator">
                Tap to complete card details
              </Text>
            )}
          </TouchableOpacity>

          {/* Wallet Tab */}
          <TouchableOpacity
            testID="checkout-payment-wallet"
            style={[
              styles.paymentTab,
              paymentType === "EasyBuy Wallet" && styles.paymentTabSelected,
            ]}
            onPress={() => {
              setPaymentType("EasyBuy Wallet");
            }}
          >
            <View style={styles.paymentTabRow}>
              <Ionicons
                name={paymentType === "EasyBuy Wallet" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={paymentType === "EasyBuy Wallet" ? colors.primary : colors.muted}
              />
              <Text style={styles.paymentTabText}>EasyBuy Wallet</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* EasyBuy Wallet Widget */}
        {paymentType === "EasyBuy Wallet" && (
          <View style={styles.walletWidgetContainer} testID="checkout-wallet-widget">
            <Text style={styles.walletBalanceText} testID="checkout-wallet-balance">
              Wallet Balance: {walletVerified ? `${walletBalance}$` : "Not verified"}
            </Text>
            {walletVerified ? (
              <View style={styles.walletVerifiedRow} testID="checkout-wallet-verified-indicator">
                <Ionicons name="checkmark-circle" size={24} color="green" />
                <Text style={styles.walletVerifiedText}>Wallet Pre-Authorized</Text>
              </View>
            ) : (
              <TouchableOpacity
                testID="wallet-verify-btn"
                style={styles.walletVerifyBtn}
                onPress={handleWalletVerify}
                disabled={walletLoading}
              >
                {walletLoading ? (
                  <ActivityIndicator color={colors.white} testID="wallet-loading-spinner" />
                ) : (
                  <Text style={styles.walletVerifyBtnText}>Verify & Pre-Authorize Wallet</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {canSubmit ? (
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

      {/* Credit Card Modal Form */}
      <Modal
        testID="checkout-card-modal"
        animationType="slide"
        transparent={true}
        visible={cardModalVisible}
        onRequestClose={() => {
          setCardModalVisible(false);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.modelCardContainer}>
            {/* Bold red warning banner */}
            <View style={styles.warningBanner} testID="checkout-card-warning-banner">
              <Text style={styles.warningText}>
                THIS IS A SECURE DEMO ENVIRONMENT. Please DO NOT enter real credit card details. Use fake numbers for testing.
              </Text>
            </View>
            <CustomInput
              testID="checkout-card-name-input"
              value={cardholderNameInput}
              setValue={setCardholderNameInput}
              placeholder={"Cardholder Name"}
            />
            <CustomInput
              testID="checkout-card-number-input"
              value={cardNumberInput}
              setValue={setCardNumberInput}
              placeholder={"Card Number (16 digits)"}
              keyboardType={"number-pad"}
            />
            <CustomInput
              testID="checkout-card-expiry-input"
              value={cardExpiryInput}
              setValue={setCardExpiryInput}
              placeholder={"Expiry (MM/YY)"}
            />
            <CustomInput
              testID="checkout-card-cvv-input"
              value={cardCvvInput}
              setValue={setCardCvvInput}
              placeholder={"CVV (3 digits)"}
              keyboardType={"number-pad"}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                testID="checkout-save-card-btn"
                style={styles.modalSaveBtn}
                onPress={() => {
                  // Validate format
                  const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
                  if (!cardholderNameInput.trim()) {
                    alert("Please enter cardholder name.");
                    return;
                  }
                  if (!/^\d{16}$/.test(cardNumberInput)) {
                    alert("Card number must be exactly 16 digits.");
                    return;
                  }
                  if (!expiryRegex.test(cardExpiryInput)) {
                    alert("Expiry must be in MM/YY format.");
                    return;
                  }
                  if (!/^\d{3}$/.test(cardCvvInput)) {
                    alert("CVV must be exactly 3 digits.");
                    return;
                  }
                  setCardDetails({
                    card_number: cardNumberInput,
                    cardholder_name: cardholderNameInput,
                    expiry: cardExpiryInput,
                    cvv: cardCvvInput,
                  });
                  setCardModalVisible(false);
                }}
              >
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="checkout-close-card-btn"
                style={styles.modalCloseBtn}
                onPress={() => {
                  setCardModalVisible(false);
                }}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  paymentSelectionContainer: {
    marginVertical: 10,
  },
  paymentTab: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.light,
  },
  paymentTabSelected: {
    borderColor: colors.primary,
  },
  paymentTabRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentTabText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: colors.dark,
  },
  paymentSubtext: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 5,
    marginLeft: 30,
  },
  walletWidgetContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.light,
  },
  walletBalanceText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.dark,
  },
  walletVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletVerifiedText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "green",
    marginLeft: 5,
  },
  walletVerifyBtn: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  walletVerifyBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  modelCardContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 320,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
  warningBanner: {
    backgroundColor: "#ffebee",
    borderColor: "#ef5350",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginBottom: 15,
  },
  warningText: {
    color: "#c62828",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  modalCloseBtn: {
    backgroundColor: colors.muted,
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  modalBtnText: {
    color: colors.white,
    fontWeight: "bold",
  },
});
