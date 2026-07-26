import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import * as api from "../../api";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import CustomButton from "../../components/CustomButton";
import DropDownPicker from "react-native-dropdown-picker";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import { PAYMENT_METHOD_LABELS } from "../../constants/payment";

const ViewOrderDetailScreen = ({ navigation, route }) => {
  const { orderDetail } = route.params;
  const [isloading, setIsloading] = useState(false);
  const label = "Loading..";
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [totalCost, setTotalCost] = useState(0);
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [statusDisable, setStatusDisable] = useState(false);
  const [order, setOrder] = useState(orderDetail);
  const [items, setItems] = useState([
    { label: "Pending", value: "pending" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
  ]);

  //method to convert the time into AM PM format
  function tConvert(time) {
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join("");
  }

  //method to convert the Data into dd-mm-yyyy format
  const dateFormat = (datex) => {
    let t = new Date(datex);
    const date = ("0" + t.getDate()).slice(-2);
    const month = ("0" + (t.getMonth() + 1)).slice(-2);
    const year = t.getFullYear();
    const hours = ("0" + t.getHours()).slice(-2);
    const minutes = ("0" + t.getMinutes()).slice(-2);
    const seconds = ("0" + t.getSeconds()).slice(-2);
    const time = tConvert(`${hours}:${minutes}:${seconds}`);
    const newDate = `${date}-${month}-${year}, ${time}`;

    return newDate;
  };

  const refreshOrderState = (nextOrder) => {
    setOrder(nextOrder);
    setStatusDisable(nextOrder?.status === "delivered");
    setValue(nextOrder?.status);
    setAddress(
      nextOrder?.country +
        ", " +
        nextOrder?.city +
        ", " +
        nextOrder?.shippingAddress
    );
    setTotalCost(
      nextOrder?.items.reduce((accumulator, object) => {
        return accumulator + Number(object.price || 0) * Number(object.quantity || 0);
      }, 0)
    );
  };

  //method to update the status using API call
  const handleUpdateStatus = (id) => {
    setIsloading(true);
    setError("");
    setAlertType("error");

    api
      .updateOrderStatus(id, value) //API call
      .then((result) => {
        if (result.success === true) {
          refreshOrderState(result.data);
          setError(`Order status is successfully updated to ${value}`);
          setAlertType("success");
          setIsloading(false);
        }
      })
      .catch((error) => {
        setAlertType("error");
        setError(error);
        console.log("error", error);
        setIsloading(false);
      });
  };

  // calculate the total cost and set the all requried variables on initial render
  useEffect(() => {
    setError("");
    setAlertType("error");
    refreshOrderState(orderDetail);
  }, [orderDetail]);
  return (
    <View style={styles.container} testID="view-order-detail-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar testID="view-order-detail-status-bar"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="view-order-detail-back-btn"
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
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="view-order-detail-heading">Order Details</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="view-order-detail-subtitle">
            View all detail about order
          </Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-order-detail-alert" />
      <ScrollView
        testID="view-order-detail-scroll"
        style={styles.bodyContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerNameContainer}>
          <View>
            <Text style={styles.containerNameText} testID="view-order-detail-shipping-heading">Ship & Bill to</Text>
          </View>
        </View>
        <View style={styles.ShipingInfoContainer}>
          <Text style={styles.secondarytextMedian} testID="view-order-detail-user-name">
            {order?.user?.name}
          </Text>
          <Text style={styles.secondarytextMedian} testID="view-order-detail-user-email">
            {order?.user?.email}
          </Text>
          <Text style={styles.secondarytextSm} testID="view-order-detail-address">{address}</Text>
          <Text style={styles.secondarytextSm} testID="view-order-detail-zipcode">{order?.zipcode}</Text>
        </View>
        <View>
          <Text style={styles.containerNameText} testID="view-order-detail-order-info-heading">Order Info</Text>
        </View>
        <View style={styles.orderInfoContainer}>
          <Text style={styles.secondarytextMedian} testID="view-order-detail-order-id">
            Order # {order?.orderId}
          </Text>
          <Text style={styles.secondarytextSm} testID="view-order-detail-ordered-date">
            Ordered on {dateFormat(order?.updatedAt)}
          </Text>
          {order?.shippedOn && (
            <Text style={styles.secondarytextSm} testID="view-order-detail-shipped-date">
              Shipped on {order?.shippedOn}
            </Text>
          )}
          {order?.deliveredOn && (
            <Text style={styles.secondarytextSm} testID="view-order-detail-delivered-date">
              Delivered on {order?.deliveredOn}
            </Text>
          )}
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.orderItemText} testID="view-order-detail-payment-method">
              Payment Method: {PAYMENT_METHOD_LABELS[order?.payment_type] || PAYMENT_METHOD_LABELS.cod}
            </Text>
            <PaymentStatusBadge
              paymentType={order?.payment_type}
              paymentStatus={order?.payment_status}
              fulfillmentStatus={order?.status}
              testID="view-order-detail-payment-status"
            />
          </View>
        </View>
        <View style={styles.containerNameContainer}>
          <View>
            <Text style={styles.containerNameText} testID="view-order-detail-package-heading">Package Details</Text>
          </View>
        </View>
        <View style={styles.orderItemsContainer}>
          <View style={styles.orderItemContainer}>
            <Text style={styles.orderItemText} testID="view-order-detail-package-status">Package</Text>
            <Text>{value}</Text>
          </View>
          <View style={styles.orderItemContainer}>
            <Text style={styles.orderItemText} testID="view-order-detail-package-date">
              Order on : {dateFormat(order?.updatedAt)}
            </Text>
          </View>
          <ScrollView
            style={styles.orderSummaryContainer}
            nestedScrollEnabled={true}
            testID="view-order-detail-summary-scroll"
          >
            {order?.items.map((product, index) => (
              <View key={index}>
                <BasicProductList
                  title={product?.productId?.title}
                  price={product?.price}
                  quantity={product?.quantity}
                  testID={`view-order-detail-product-${index}`}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.orderItemContainer}>
            <Text style={styles.orderItemText} testID="view-order-detail-total-label">Total</Text>
            <Text testID="view-order-detail-total-value">{totalCost}$</Text>
          </View>
        </View>
        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <View>
          <DropDownPicker
            style={{ width: 200 }}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            disabled={statusDisable}
            disabledStyle={{
              backgroundColor: colors.light,
              borderColor: colors.white,
            }}
            labelStyle={{ color: colors.muted }}
            testID="view-order-detail-status-dropdown"
          />
        </View>
        <View>
          {statusDisable === false ? (
            <CustomButton
              text={"Update"}
              onPress={() => handleUpdateStatus(order?._id)}
              testID="view-order-detail-update-btn"
            />
          ) : (
            <CustomButton text={"Update"} disabled testID="view-order-detail-update-btn" />
          )}
        </View>
      </View>
    </View>
  );
};

export default ViewOrderDetailScreen;

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
  bottomContainer: {
    backgroundColor: colors.white,
    width: "110%",
    height: 70,
    borderTopLeftRadius: 10,
    borderTopEndRadius: 10,
    elevation: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingLeft: 10,
    paddingRight: 10,
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
  paymentSummaryRow: {
    width: "100%",
    marginTop: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  primarytextMedian: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
  secondarytextMedian: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyView: {
    height: 20,
  },
});
