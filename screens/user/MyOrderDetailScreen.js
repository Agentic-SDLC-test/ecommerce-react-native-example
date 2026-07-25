import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import StepIndicator from "react-native-step-indicator";
import { colors } from "../../constants";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import {
  canResumeWalletPayment,
  getPaymentMethodLabel,
} from "../../utils/paymentPresentation";
import { isWalletMockEnabled } from "../../utils/featureFlags";

const MyOrderDetailScreen = ({ navigation, route }) => {
  const order = route.params?.orderDetail;
  const [isloading] = useState(false);
  const [label] = useState("Loading..");
  const [error] = useState("");
  const [alertType] = useState("error");
  const walletEnabled = isWalletMockEnabled();

  const labels = ["Processing", "Shipping", "Delivery"];
  const trackingState =
    order?.status === "pending" ? 1 : order?.status === "shipped" ? 2 : 3;
  const address = [order?.country, order?.city, order?.shippingAddress]
    .filter(Boolean)
    .join(", ");
  const totalCost = useMemo(
    () =>
      Number(order?.amount) ||
      order?.items?.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [order]
  );

  const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: colors.primary,
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: colors.primary,
    stepStrokeUnFinishedColor: "#aaaaaa",
    separatorFinishedColor: "#fe7013",
    separatorUnFinishedColor: "#aaaaaa",
    stepIndicatorFinishedColor: "#fe7013",
    stepIndicatorUnFinishedColor: "#ffffff",
    stepIndicatorCurrentColor: colors.white,
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: "#fe7013",
    stepIndicatorLabelFinishedColor: "#ffffff",
    stepIndicatorLabelUnFinishedColor: "#aaaaaa",
    labelColor: "#999999",
    labelSize: 13,
    currentStepLabelColor: "#fe7013",
  };

  function tConvert(time) {
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? "AM" : "PM";
      time[0] = +time[0] % 12 || 12;
    }
    return time.join("");
  }

  const dateFormat = (datex) => {
    let t = new Date(datex);
    const date = ("0" + t.getDate()).slice(-2);
    const month = ("0" + (t.getMonth() + 1)).slice(-2);
    const year = t.getFullYear();
    const hours = ("0" + t.getHours()).slice(-2);
    const minutes = ("0" + t.getMinutes()).slice(-2);
    const seconds = ("0" + t.getSeconds()).slice(-2);
    const time = tConvert(`${hours}:${minutes}:${seconds}`);
    return `${date}-${month}-${year}, ${time}`;
  };

  return (
    <View style={styles.container} testID="my-order-detail-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="my-order-detail-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="my-order-detail-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="my-order-detail-heading">
            Order Detials
          </Text>
        </View>
        <View>
          <Text
            style={styles.screenNameParagraph}
            testID="my-order-detail-subtitle"
          >
            View all detail about order
          </Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="my-order-detail-alert" />
      <ScrollView
        testID="my-order-detail-scroll"
        style={styles.bodyContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerNameContainer}>
          <View>
            <Text
              style={styles.containerNameText}
              testID="my-order-detail-shipping-heading"
            >
              Shipping Address
            </Text>
          </View>
        </View>
        <View style={styles.ShipingInfoContainer}>
          <Text style={styles.secondarytextSm} testID="my-order-detail-address">
            {address}
          </Text>
          <Text style={styles.secondarytextSm} testID="my-order-detail-zipcode">
            {order?.zipcode}
          </Text>
        </View>
        <View>
          <Text
            style={styles.containerNameText}
            testID="my-order-detail-order-info-heading"
          >
            Order Info
          </Text>
        </View>
        <View style={styles.orderInfoContainer}>
          <Text style={styles.secondarytextMedian} testID="my-order-detail-order-id">
            Order # {order?.orderId}
          </Text>
          <Text style={styles.secondarytextSm} testID="my-order-detail-ordered-date">
            Ordered on {dateFormat(order?.updatedAt)}
          </Text>
          {order?.shippedOn && (
            <Text
              style={styles.secondarytextSm}
              testID="my-order-detail-shipped-date"
            >
              Shipped on {order?.shippedOn}
            </Text>
          )}
          {order?.deliveredOn && (
            <Text
              style={styles.secondarytextSm}
              testID="my-order-detail-delivered-date"
            >
              Delivered on {order?.deliveredOn}
            </Text>
          )}
          <View style={{ marginTop: 15, width: "100%" }}>
            <StepIndicator
              testID="my-order-detail-step-indicator"
              customStyles={customStyles}
              currentPosition={trackingState}
              stepCount={3}
              labels={labels}
            />
          </View>
        </View>

        <View style={styles.containerNameContainer}>
          <View>
            <Text
              style={styles.containerNameText}
              testID="my-order-detail-payment-heading"
            >
              Payment
            </Text>
          </View>
        </View>
        <View style={styles.paymentInfoContainer}>
          <View style={styles.paymentRow}>
            <Text style={styles.orderItemText}>Method</Text>
            <Text
              style={styles.secondarytextMedian}
              testID="my-order-detail-payment-method"
            >
              {getPaymentMethodLabel(order?.payment_type)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.orderItemText}>Status</Text>
            <PaymentStatusBadge
              paymentStatus={order?.payment_status}
              paymentType={order?.payment_type}
              testID="my-order-detail-payment-status"
            />
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.orderItemText}>Last updated</Text>
            <Text
              style={styles.secondarytextSm}
              testID="my-order-detail-payment-updated-at"
            >
              {dateFormat(order?.payment_updated_at || order?.updatedAt)}
            </Text>
          </View>
          {order?.payment_failure_reason ? (
            <Text
              style={styles.paymentFailureText}
              testID="my-order-detail-payment-failure"
            >
              {order.payment_failure_reason}
            </Text>
          ) : null}
          {walletEnabled && canResumeWalletPayment(order) && (
            <View style={styles.paymentActionContainer}>
              <CustomButton
                testID="my-order-detail-resume-payment-btn"
                text={
                  order?.payment_status === "pending"
                    ? "Resume wallet payment"
                    : "Try wallet payment again"
                }
                onPress={() =>
                  navigation.navigate("walletpayment", {
                    order,
                    origin: "my-order-detail",
                  })
                }
              />
            </View>
          )}
        </View>

        <View style={styles.containerNameContainer}>
          <View>
            <Text
              style={styles.containerNameText}
              testID="my-order-detail-package-heading"
            >
              Package Details
            </Text>
          </View>
        </View>
        <View style={styles.orderItemsContainer}>
          <View style={styles.orderItemContainer}>
            <Text style={styles.orderItemText}>Package</Text>
            <Text testID="my-order-detail-package-status">{order?.status}</Text>
          </View>
          <View style={styles.orderItemContainer}>
            <Text
              style={styles.orderItemText}
              testID="my-order-detail-package-date"
            >
              Order on : {order?.updatedAt}
            </Text>
          </View>
          <ScrollView
            testID="my-order-detail-summary-scroll"
            style={styles.orderSummaryContainer}
            nestedScrollEnabled={true}
          >
            {order?.items.map((product, index) => (
              <View key={index}>
                <BasicProductList
                  testID={`my-order-detail-product-${index}`}
                  title={product?.productId?.title}
                  price={product?.price}
                  quantity={product?.quantity}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.orderItemContainer}>
            <Text style={styles.orderItemText} testID="my-order-detail-total-label">
              Total
            </Text>
            <Text testID="my-order-detail-total-value">{totalCost}$</Text>
          </View>
        </View>
        <View style={styles.emptyView}></View>
      </ScrollView>
    </View>
  );
};

export default MyOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 0,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 10,
    fontSize: 15,
  },
  bodyContainer: { flex: 1, width: "100%", padding: 5 },
  ShipingInfoContainer: {
    marginTop: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.muted,
    elevation: 5,
    marginBottom: 10,
  },
  containerNameContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  containerNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.muted,
  },
  secondarytextSm: {
    color: colors.muted,
    fontSize: 13,
  },
  orderItemsContainer: {
    marginTop: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.muted,
    elevation: 3,
    marginBottom: 10,
  },
  orderItemContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItemText: {
    fontSize: 13,
    color: colors.muted,
  },
  orderSummaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    maxHeight: 220,
    width: "100%",
    marginBottom: 5,
  },
  orderInfoContainer: {
    marginTop: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.muted,
    elevation: 1,
    marginBottom: 10,
  },
  secondarytextMedian: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "bold",
  },
  paymentInfoContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  paymentRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentFailureText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  paymentActionContainer: {
    marginTop: 10,
  },
  emptyView: {
    height: 20,
  },
});
