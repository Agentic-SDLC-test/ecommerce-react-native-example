import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  ActivityIndicator,
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

  const [paymentType, setPaymentType] = useState("cod");
  const [walletBalance, setWalletBalance] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectStep, setRedirectStep] = useState(0);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardSaved, setCardSaved] = useState(false);
  const [cardErrors, setCardErrors] = useState({});

  const fetchBalance = async () => {
    try {
      const response = await api.getUserProfile();
      if (response.success && response.data) {
        setWalletBalance(response.data.balance);
      }
    } catch (err) {
      console.log("Error fetching profile", err);
    }
  };

  const validateCard = () => {
    let errors = {};
    if (!cardholderName.trim()) {
      errors.cardholderName = "Cardholder Name is required";
    }
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (!cleanNum || cleanNum.length !== 16 || isNaN(Number(cleanNum))) {
      errors.cardNumber = "Card number must be 16 digits";
    }
    if (!expiryDate || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate)) {
      errors.expiryDate = "Expiry date must be in MM/YY format";
    }
    if (!cvv || cvv.length !== 3 || isNaN(Number(cvv))) {
      errors.cvv = "CVV must be 3 digits";
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCard = () => {
    if (validateCard()) {
      setCardSaved(true);
      setCardModalVisible(false);
    }
  };
  const [zipcode, setZipcode] = useState("");

  // method to call checkout API
  const triggerCheckoutAPI = async (type = paymentType, status = "pending") => {
    setIsloading(true);
    var payload = [];
    var totalamount = 0;

    cartproduct.forEach((product) => {
      let obj = {
        productId: product._id,
        price: product.price,
        quantity: product.quantity,
      };
      totalamount += parseInt(product.price) * parseInt(product.quantity);
      payload.push(obj);
    });

    try {
      const result = await api.checkout({
        items: payload,
        amount: totalamount,
        discount: 0,
        payment_type: type,
        country: country,
        status: status,
        city: city,
        zipcode: zipcode,
        shippingAddress: streetAddress,
      });

      console.log("Checkout=>", result);
      setIsloading(false);
      if (result.success === true) {
        emptyCart("empty");
        navigation.replace("orderconfirm");
      }
    } catch (error) {
      setIsloading(false);
      console.log("error", error);
    }
  };

  //method to handle checkout
  const handleCheckout = async () => {
    if (paymentType === "redirect") {
      setIsRedirecting(true);
      setRedirectStep(0); // "Redirecting to secure gateway..."
      
      setTimeout(() => {
        setRedirectStep(1); // "Processing payment..."
      }, 1000);

      setTimeout(() => {
        setRedirectStep(2); // "Payment successful, returning to EasyBuy..."
      }, 2000);

      setTimeout(async () => {
        setIsRedirecting(false);
        await triggerCheckoutAPI("redirect", "pending");
      }, 3000);

    } else if (paymentType === "wallet") {
      await triggerCheckoutAPI("wallet", "pending");
    } else if (paymentType === "card") {
      await triggerCheckoutAPI("card", "pending");
    } else {
      await triggerCheckoutAPI("cod", "pending");
    }
  };

  // set the address, total cost, and fetch wallet balance on initial render
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
    fetchBalance();
  }, []);

  const isAddressComplete = !!(country && city && streetAddress);
  const isCardComplete = paymentType !== "card" || cardSaved;
  const isWalletComplete = paymentType !== "wallet" || (walletBalance !== null && walletBalance >= (totalCost + deliveryCost));
  const isSubmitDisabled = !isAddressComplete || !isCardComplete || !isWalletComplete;

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
        <Text style={styles.primaryText} testID="checkout-payment-heading">Payment Method</Text>
        <View style={styles.paymentSelectorContainer} testID="payment-selector">
          {/* Cash on Delivery Tile */}
          <TouchableOpacity
            testID="payment-tile-cod"
            style={[
              styles.paymentTile,
              paymentType === "cod" && styles.paymentTileSelected,
            ]}
            onPress={() => setPaymentType("cod")}
          >
            <Ionicons
              name="cash-outline"
              size={24}
              color={paymentType === "cod" ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.paymentTileText,
                paymentType === "cod" && styles.paymentTileTextSelected,
              ]}
            >
              COD
            </Text>
          </TouchableOpacity>

          {/* Credit/Debit Card Tile */}
          <TouchableOpacity
            testID="payment-tile-card"
            style={[
              styles.paymentTile,
              paymentType === "card" && styles.paymentTileSelected,
            ]}
            onPress={() => {
              setPaymentType("card");
              if (!cardSaved) {
                setCardModalVisible(true);
              }
            }}
          >
            <Ionicons
              name="card-outline"
              size={24}
              color={paymentType === "card" ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.paymentTileText,
                paymentType === "card" && styles.paymentTileTextSelected,
              ]}
            >
              Card
            </Text>
          </TouchableOpacity>

          {/* In-App Wallet Tile */}
          <TouchableOpacity
            testID="payment-tile-wallet"
            style={[
              styles.paymentTile,
              paymentType === "wallet" && styles.paymentTileSelected,
            ]}
            onPress={() => {
              setPaymentType("wallet");
              fetchBalance();
            }}
          >
            <Ionicons
              name="wallet-outline"
              size={24}
              color={paymentType === "wallet" ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.paymentTileText,
                paymentType === "wallet" && styles.paymentTileTextSelected,
              ]}
            >
              Wallet
            </Text>
          </TouchableOpacity>

          {/* Simulated Redirect Tile */}
          <TouchableOpacity
            testID="payment-tile-redirect"
            style={[
              styles.paymentTile,
              paymentType === "redirect" && styles.paymentTileSelected,
            ]}
            onPress={() => setPaymentType("redirect")}
          >
            <Ionicons
              name="globe-outline"
              size={24}
              color={paymentType === "redirect" ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.paymentTileText,
                paymentType === "redirect" && styles.paymentTileTextSelected,
              ]}
            >
              Redirect
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Detail Section */}
        {paymentType === "cod" && (
          <View style={styles.paymentDetailContainer} testID="payment-detail-cod">
            <Text style={styles.paymentDetailText}>
              Pay with Cash on Delivery. Order payment status will be "Pending".
            </Text>
          </View>
        )}

        {paymentType === "card" && (
          <View style={styles.paymentDetailContainer} testID="payment-detail-card">
            <TouchableOpacity
              testID="edit-card-btn"
              style={styles.cardInfoRow}
              onPress={() => setCardModalVisible(true)}
            >
              <View style={styles.row}>
                <Ionicons name="card" size={20} color={colors.primary} />
                <Text style={styles.cardInfoText} testID="card-display-text">
                  {cardSaved
                    ? `Card: **** **** **** ${cardNumber.replace(/\s+/g, "").slice(-4)}`
                    : "No card details saved. Tap to enter details."}
                </Text>
              </View>
              <Text style={styles.editCardLink}>
                {cardSaved ? "Edit" : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {paymentType === "wallet" && (
          <View style={styles.paymentDetailContainer} testID="payment-detail-wallet">
            <View style={styles.walletInfoRow}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
              <Text style={styles.walletBalanceText} testID="wallet-balance-text">
                {walletBalance !== null
                  ? `Wallet Balance: $${walletBalance.toFixed(2)}`
                  : "Loading balance..."}
              </Text>
            </View>
            {walletBalance !== null && walletBalance < (totalCost + deliveryCost) && (
              <Text style={styles.insufficientBalanceText} testID="wallet-warning-text">
                Insufficient wallet balance to place order.
              </Text>
            )}
          </View>
        )}

        {paymentType === "redirect" && (
          <View style={styles.paymentDetailContainer} testID="payment-detail-redirect">
            <Text style={styles.paymentDetailText}>
              Will simulate redirecting to a secure payment gateway upon checkout.
            </Text>
          </View>
        )}

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        <CustomButton
          testID="checkout-submit-btn"
          text={"Submit Order"}
          disabled={isSubmitDisabled}
          onPress={() => {
            handleCheckout();
          }}
        />
      </View>
      
      {/* Address Modal */}
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

      {/* Redirect Simulation Modal */}
      <Modal
        testID="checkout-redirect-modal"
        animationType="fade"
        transparent={true}
        visible={isRedirecting}
      >
        <View style={styles.redirectModalOverlay}>
          <View style={styles.redirectModalContainer}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
            <Text style={styles.redirectModalTitle}>Secure Checkout</Text>
            <Text style={styles.redirectModalMessage} testID="redirect-modal-msg">
              {redirectStep === 0 && "Redirecting to secure gateway..."}
              {redirectStep === 1 && "Processing payment..."}
              {redirectStep === 2 && "Payment successful, returning to EasyBuy..."}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Card Form Modal */}
      <Modal
        testID="checkout-card-modal"
        animationType="slide"
        transparent={true}
        visible={cardModalVisible}
        onRequestClose={() => {
          setCardModalVisible(!cardModalVisible);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.modelCardContainer}>
            <Text style={styles.modalHeaderTitle}>Card Details</Text>
            
            <CustomInput
              testID="card-name-input"
              value={cardholderName}
              setValue={setCardholderName}
              placeholder={"Cardholder Name"}
            />
            {cardErrors.cardholderName && (
              <Text style={styles.errorText} testID="card-name-error">{cardErrors.cardholderName}</Text>
            )}

            <CustomInput
              testID="card-number-input"
              value={cardNumber}
              setValue={setCardNumber}
              placeholder={"Card Number (16 digits)"}
              keyboardType={"number-pad"}
            />
            {cardErrors.cardNumber && (
              <Text style={styles.errorText} testID="card-num-error">{cardErrors.cardNumber}</Text>
            )}

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <CustomInput
                  testID="card-expiry-input"
                  value={expiryDate}
                  setValue={setExpiryDate}
                  placeholder={"Expiry (MM/YY)"}
                />
                {cardErrors.expiryDate && (
                  <Text style={styles.errorText} testID="card-expiry-error">{cardErrors.expiryDate}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  testID="card-cvv-input"
                  value={cvv}
                  setValue={setCvv}
                  placeholder={"CVV (3 digits)"}
                  keyboardType={"number-pad"}
                  secureTextEntry={true}
                />
                {cardErrors.cvv && (
                  <Text style={styles.errorText} testID="card-cvv-error">{cardErrors.cvv}</Text>
                )}
              </View>
            </View>

            <View style={{ width: "100%", marginTop: 15 }}>
              <CustomButton
                testID="card-save-btn"
                onPress={handleSaveCard}
                text={"Save Details"}
              />
              <TouchableOpacity
                testID="card-close-btn"
                onPress={() => setCardModalVisible(false)}
                style={styles.closeTextButton}
              >
                <Text style={styles.closeText}>Cancel</Text>
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
  paymentSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  paymentTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    marginHorizontal: 3,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  paymentTileSelected: {
    borderColor: colors.primary,
  },
  paymentTileText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.muted,
    marginTop: 5,
  },
  paymentTileTextSelected: {
    color: colors.primary,
  },
  paymentDetailContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.light,
  },
  paymentDetailText: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfoText: {
    fontSize: 14,
    color: colors.dark,
    marginLeft: 10,
    fontWeight: "bold",
  },
  editCardLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  walletInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  walletBalanceText: {
    fontSize: 15,
    color: colors.dark,
    fontWeight: "bold",
    marginLeft: 10,
  },
  insufficientBalanceText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 5,
    fontWeight: "bold",
  },
  redirectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  redirectModalContainer: {
    width: 280,
    padding: 25,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
  },
  redirectModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  redirectModalMessage: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
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
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 15,
  },
  rowInputs: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    alignSelf: "flex-start",
    marginBottom: 5,
    marginLeft: 5,
    fontWeight: "bold",
  },
  closeTextButton: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  closeText: {
    color: colors.muted,
    fontWeight: "bold",
    fontSize: 14,
  },
});
