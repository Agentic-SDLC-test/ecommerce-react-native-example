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
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import {
  PAYMENT_METHODS,
  getPaymentStatusForMethod,
} from "../../utils/payment";

const CheckoutScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
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

  const handleSelectPayment = (paymentType) => {
    setSelectedPaymentType(paymentType);
    setError("");
  };

  const buildCheckoutPayload = () => {
    const payload = [];
    let totalamount = 0;

    cartproduct.forEach((product) => {
      const obj = {
        productId: product._id,
        price: product.price,
        quantity: product.quantity,
      };
      totalamount += parseInt(product.price) * parseInt(product.quantity);
      payload.push(obj);
    });

    return {
      items: payload,
      amount: totalamount,
      discount: 0,
      payment_type: selectedPaymentType,
      payment_status: getPaymentStatusForMethod(selectedPaymentType),
      country: country,
      status: "pending",
      city: city,
      zipcode: zipcode,
      shippingAddress: streetAddress,
    };
  };

  const handleCheckout = async () => {
    if (!selectedPaymentType) {
      setError("Please select a payment method before placing your order.");
      setAlertType("error");
      return;
    }

    setIsloading(true);
    setError("");
    setAlertType("error");

    api
      .checkout(buildCheckoutPayload())
      .then((result) => {
        if (result.success == true) {
          setIsloading(false);
          emptyCart("empty");
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          setIsloading(false);
          setError(result.message || "Checkout failed. Please try again.");
          setAlertType("error");
        }
      })
      .catch((checkoutError) => {
        setIsloading(false);
        setError(
          typeof checkoutError === "string"
            ? checkoutError
            : "Checkout failed. Please try again."
        );
        setAlertType("error");
        console.log("error", checkoutError);
      });
  };

  const isAddressComplete = country && city && streetAddress != "";
  const canSubmit = isAddressComplete && selectedPaymentType;

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
      <CustomAlert message={error} type={alertType} testID="checkout-alert" />
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
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPaymentType === method.value;
            const testIdSuffix =
              method.value === "cod" ? "cod" : "mock-wallet";
            return (
              <TouchableOpacity
                key={method.value}
                testID={`checkout-payment-${testIdSuffix}`}
                style={[
                  styles.paymentOption,
                  isSelected && styles.paymentOptionSelected,
                ]}
                onPress={() => handleSelectPayment(method.value)}
              >
                <View style={styles.paymentOptionContent}>
                  <Text
                    style={[
                      styles.secondaryTextSm,
                      isSelected && styles.selectedPaymentLabel,
                    ]}
                  >
                    {method.label}
                  </Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
                {isSelected && (
                  <Text
                    style={styles.selectedIndicator}
                    testID={`checkout-payment-selected-${testIdSuffix}`}
                  >
                    Selected
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

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
  paymentOption: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
    minHeight: 60,
  },
  paymentOptionSelected: {
    backgroundColor: colors.light,
  },
  paymentOptionContent: {
    flex: 1,
    paddingRight: 10,
  },
  paymentDescription: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  selectedPaymentLabel: {
    color: colors.primary,
  },
  selectedIndicator: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
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
