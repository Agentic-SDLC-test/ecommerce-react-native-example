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
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import {
  MOCK_WALLET_MESSAGE,
  getPaymentTypeLabel,
  isMockWalletPaymentEnabled,
  isWalletMock,
} from "../../utils/payment";
import {
  buildCheckoutPayload,
  getAddressSummary,
  hasCompleteAddress,
} from "../../utils/checkout";

const CheckoutScreen = ({ navigation }) => {
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  const deliveryCost = 0;
  const [totalCost, setTotalCost] = useState(0);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("cod");
  const [error, setError] = useState("");

  const mockWalletEnabled = isMockWalletPaymentEnabled();
  const addressSummary = getAddressSummary({
    country,
    city,
    shippingAddress: streetAddress,
  });
  const isAddressComplete = hasCompleteAddress({
    country,
    city,
    zipcode,
    shippingAddress: streetAddress,
  });

  const submitOrder = async (paymentAcknowledged = false) => {
    let payload;

    try {
      payload = buildCheckoutPayload({
        cartItems: cartproduct,
        selectedPaymentType,
        paymentAcknowledged,
        country,
        city,
        zipcode,
        shippingAddress: streetAddress,
      });
    } catch (checkoutError) {
      setError(checkoutError.message);
      return;
    }

    setIsloading(true);
    setError("");

    api
      .checkout(payload)
      .then((result) => {
        if (result.success === true) {
          setWalletModalVisible(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          setError(result.message || "Unable to place order");
        }
        setIsloading(false);
      })
      .catch((requestError) => {
        setError(requestError.message);
        setWalletModalVisible(false);
        setIsloading(false);
        console.log("error", requestError);
      });
  };

  const handleSelectPayment = (nextType) => {
    setSelectedPaymentType(nextType);
    setError("");
  };

  const handleCheckout = () => {
    if (isloading) {
      return;
    }

    if (selectedPaymentType === "wallet_mock") {
      setWalletModalVisible(true);
      return;
    }

    submitOrder(false);
  };

  useEffect(() => {
    setTotalCost(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + object.price * object.quantity;
      }, 0)
    );
  }, [cartproduct]);

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
      <View style={styles.alertContainer}>
        <CustomAlert message={error} type="error" testID="checkout-alert" />
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
            onPress={() => setAddressModalVisible(true)}
          >
            <Text style={styles.secondaryTextSm} testID="checkout-address-label">Address</Text>
            <View>
              {addressSummary ? (
                <Text
                  testID="checkout-address-value"
                  style={styles.secondaryTextSm}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {addressSummary.length < 25
                    ? `${addressSummary}`
                    : `${addressSummary.substring(0, 25)}...`}
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
              selectedPaymentType === "cod" ? styles.paymentOptionSelected : null,
            ]}
            onPress={() => handleSelectPayment("cod")}
            testID="checkout-payment-cod"
          >
            <Text style={styles.secondaryTextSm}>Cash on delivery</Text>
            <Text style={styles.paymentOptionHint}>Pay when the order arrives.</Text>
          </TouchableOpacity>
          {mockWalletEnabled ? (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentType === "wallet_mock" ? styles.paymentOptionSelected : null,
              ]}
              onPress={() => handleSelectPayment("wallet_mock")}
              testID="checkout-payment-wallet"
            >
              <Text style={styles.secondaryTextSm}>Wallet mock</Text>
              <Text style={styles.paymentOptionHint}>{MOCK_WALLET_MESSAGE}</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.paymentSummary} testID="checkout-payment-summary">
            <Text style={styles.secondaryTextSm} testID="checkout-method-label">Method</Text>
            <Text style={styles.primaryTextSm} testID="checkout-method-value">
              {getPaymentTypeLabel(selectedPaymentType)}
            </Text>
            <Text
              style={styles.walletNote}
              testID={isWalletMock(selectedPaymentType) ? "checkout-wallet-note" : "checkout-cod-note"}
            >
              {isWalletMock(selectedPaymentType) ? MOCK_WALLET_MESSAGE : "Pay on delivery"}
            </Text>
          </View>
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {isAddressComplete && !isloading ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={"Submit Order"}
            onPress={handleCheckout}
          />
        ) : (
          <CustomButton testID="checkout-submit-btn" text={"Submit Order"} disabled />
        )}
      </View>
      <Modal
        testID="checkout-address-modal"
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => {
          setAddressModalVisible(!addressModalVisible);
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
            {country || city || streetAddress || zipcode ? (
              <CustomButton
                testID="checkout-save-address-btn"
                onPress={() => {
                  setAddressModalVisible(false);
                }}
                text={"save"}
              />
            ) : (
              <CustomButton
                testID="checkout-close-modal-btn"
                onPress={() => {
                  setAddressModalVisible(false);
                }}
                text={"close"}
              />
            )}
          </View>
        </View>
      </Modal>
      <Modal
        testID="checkout-wallet-modal"
        animationType="slide"
        transparent={true}
        visible={walletModalVisible}
        onRequestClose={() => {
          setWalletModalVisible(false);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.walletModalContainer}>
            <Text style={styles.primaryText}>Confirm wallet mock</Text>
            <Text style={styles.walletModalCopy} testID="checkout-wallet-modal-copy">
              {MOCK_WALLET_MESSAGE}
            </Text>
            <CustomButton
              testID="checkout-wallet-confirm-btn"
              onPress={() => submitOrder(true)}
              text={"Confirm demo payment"}
            />
            <CustomButton
              testID="checkout-wallet-cancel-btn"
              onPress={() => setWalletModalVisible(false)}
              text={"Cancel"}
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
  },
  alertContainer: {
    width: "100%",
    paddingHorizontal: 20,
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
  paymentOption: {
    borderWidth: 1,
    borderColor: colors.shadow,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary_light,
  },
  paymentOptionHint: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  paymentSummary: {
    paddingTop: 5,
  },
  walletNote: {
    color: colors.muted,
    marginTop: 6,
    fontSize: 12,
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
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
  walletModalContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    width: 320,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
  walletModalCopy: {
    color: colors.muted,
    marginBottom: 20,
  },
});
