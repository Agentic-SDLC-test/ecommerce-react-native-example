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
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { isWalletPaymentsEnabled } from "../../utils/features";
import { getPaymentMethodLabel } from "../../utils/payments";

const WALLET_TIMEOUT_MS = 60000;

const CheckoutScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState("cod");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);
  const walletTimeoutRef = useRef(null);
  const walletPaymentsEnabled = isWalletPaymentsEnabled();

  const [deliveryCost] = useState(0);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  const totalCost = useMemo(
    () =>
      cartproduct.reduce(
        (accumulator, object) =>
          accumulator + Number(object.price || 0) * Number(object.quantity || 0),
        0
      ),
    [cartproduct]
  );
  const addressReady = Boolean(country && city && streetAddress);

  const clearWalletTimeout = () => {
    if (walletTimeoutRef.current) {
      clearTimeout(walletTimeoutRef.current);
      walletTimeoutRef.current = null;
    }
  };

  const setAlert = (message, type = "error") => {
    setError(message);
    setAlertType(type);
  };

  const buildOrderItems = () =>
    cartproduct.map((product) => ({
      productId: product._id,
      price: product.price,
      quantity: product.quantity,
    }));

  const handleSelectPaymentMethod = (type) => {
    setSelectedPaymentType(type);
    setAlert("");
  };

  const handleWalletOutcome = async (paymentStatus, failureReason) => {
    if (!pendingOrder?._id) {
      return;
    }

    clearWalletTimeout();
    setIsloading(true);
    setAlert("");

    const payload = { payment_status: paymentStatus };
    if (failureReason) {
      payload.payment_failure_reason = failureReason;
    }

    api
      .updateOrderPayment(pendingOrder._id, payload)
      .then((result) => {
        if (result.success === true) {
          setPendingOrder(result.data);
          setWalletModalVisible(false);
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          setIsloading(false);
          setAlert(result.message || "Unable to update payment status");
        }
      })
      .catch((updateError) => {
        setIsloading(false);
        setAlert(updateError.message || String(updateError));
      });
  };

  const handleWalletTimeout = () => {
    handleWalletOutcome("failed", "timeout");
  };

  const handleSubmitOrder = async () => {
    setIsloading(true);
    setAlert("");

    api
      .checkout({
        items: buildOrderItems(),
        amount: totalCost,
        discount: 0,
        payment_type: selectedPaymentType,
        country: country,
        status: "pending",
        city: city,
        zipcode: zipcode,
        shippingAddress: streetAddress,
      })
      .then((result) => {
        if (result.success == true) {
          if (selectedPaymentType === "cod") {
            setIsloading(false);
            emptyCart("empty");
            navigation.replace("orderconfirm", { order: result.data });
            return;
          }

          setPendingOrder(result.data);
          setWalletModalVisible(true);
          setIsloading(false);
          return;
        }

        setIsloading(false);
        setAlert(result.message || "Unable to place order");
      })
      .catch((checkoutError) => {
        setIsloading(false);
        setAlert(checkoutError.message || String(checkoutError));
      });
  };

  useEffect(() => {
    if (addressReady) {
      setAddress(`${streetAddress}, ${city}, ${country}`);
    } else {
      setAddress("");
    }
  }, [addressReady, city, country, streetAddress]);

  useEffect(() => {
    if (walletPaymentsEnabled) {
      return;
    }

    setSelectedPaymentType("cod");
  }, [walletPaymentsEnabled]);

  useEffect(() => {
    clearWalletTimeout();

    if (walletModalVisible && pendingOrder?._id) {
      walletTimeoutRef.current = setTimeout(() => {
        handleWalletTimeout();
      }, WALLET_TIMEOUT_MS);
    }

    return () => {
      clearWalletTimeout();
    };
  }, [walletModalVisible, pendingOrder]);

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
            <Text style={styles.secondaryTextSm} testID="checkout-grand-total-value">
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
              {address ? (
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
        <View style={styles.listContainer}>
          <TouchableOpacity
            testID="checkout-payment-cod"
            style={[
              styles.paymentOption,
              selectedPaymentType === "cod" ? styles.paymentOptionSelected : null,
            ]}
            onPress={() => handleSelectPaymentMethod("cod")}
          >
            <Text style={styles.secondaryTextSm}>
              {getPaymentMethodLabel("cod")}
            </Text>
            <Text style={styles.paymentMeta}>Payment stays pending until delivery.</Text>
          </TouchableOpacity>
          {walletPaymentsEnabled ? (
            <TouchableOpacity
              testID="checkout-payment-wallet"
              style={[
                styles.paymentOption,
                selectedPaymentType === "wallet_mock" ? styles.paymentOptionSelected : null,
              ]}
              onPress={() => handleSelectPaymentMethod("wallet_mock")}
            >
              <Text style={styles.secondaryTextSm}>
                {getPaymentMethodLabel("wallet_mock")}
              </Text>
              <Text style={styles.paymentMeta}>
                Mock payment only. No real charge is collected.
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <CustomAlert message={error} type={alertType} testID="checkout-alert" />
        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {addressReady ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={"Submit Order"}
            onPress={() => {
              handleSubmitOrder();
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
            {addressReady ? (
              <CustomButton
                testID="checkout-save-address-btn"
                onPress={() => {
                  setModalVisible(!modalVisible);
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
      <Modal
        testID="checkout-wallet-modal"
        animationType="fade"
        transparent={true}
        visible={walletModalVisible}
        onRequestClose={() => {
          handleWalletOutcome("failed", "cancelled");
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.walletModalContainer}>
            <Text style={styles.primaryText}>Mock wallet payment</Text>
            <Text style={styles.walletText} testID="checkout-wallet-total">
              Order total: {totalCost + deliveryCost}$
            </Text>
            <Text style={styles.walletText} testID="checkout-wallet-copy">
              This is a mock wallet flow. No real charge is collected.
            </Text>
            <CustomButton
              testID="checkout-wallet-confirm-btn"
              onPress={() => handleWalletOutcome("paid")}
              text={"Confirm mock payment"}
              disabled={isloading}
            />
            <CustomButton
              testID="checkout-wallet-decline-btn"
              onPress={() => handleWalletOutcome("failed", "declined")}
              text={"Simulate decline"}
              disabled={isloading}
            />
            <CustomButton
              testID="checkout-wallet-cancel-btn"
              onPress={() => handleWalletOutcome("failed", "cancelled")}
              text={"Cancel"}
              disabled={isloading}
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
    gap: 10,
  },
  paymentOption: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light,
    padding: 12,
    gap: 6,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#fff4ec",
  },
  paymentMeta: {
    color: colors.muted,
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
    backgroundColor: "rgba(0, 0, 0, 0.35)",
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
  walletModalContainer: {
    width: 320,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  walletText: {
    color: colors.muted,
  },
});
