import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import PaymentStatusBadge from "../PaymentStatusBadge";
import { getPaymentMethodLabel } from "../../utils/paymentPresentation";

function getTime(date) {
  let t = new Date(date);
  const hours = ("0" + t.getHours()).slice(-2);
  const minutes = ("0" + t.getMinutes()).slice(-2);
  const seconds = ("0" + t.getSeconds()).slice(-2);
  let time = `${hours}:${minutes}:${seconds}`;
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) {
    time = time.slice(1);
    time[5] = +time[0] < 12 ? " AM" : " PM";
    time[0] = +time[0] % 12 || 12;
  }

  return time.join("");
}

const dateFormat = (datex) => {
  let t = new Date(datex);
  const date = ("0" + t.getDate()).slice(-2);
  const month = ("0" + (t.getMonth() + 1)).slice(-2);
  const year = t.getFullYear();
  return `${date}-${month}-${year}`;
};

const OrderList = ({ item, onPress, testID }) => {
  const quantity = item?.items?.reduce(
    (count, orderItem) => count + Number(orderItem.quantity || 0),
    0
  );
  const computedTotal = item?.items?.reduce(
    (total, orderItem) =>
      total + Number(orderItem.price || 0) * Number(orderItem.quantity || 0),
    0
  );
  const totalCost = Number(item?.amount ?? computedTotal ?? 0);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.innerRow}>
        <View>
          <Text
            style={styles.primaryText}
            testID={testID ? `${testID}-order-id` : undefined}
          >
            Order # {item?.orderId}
          </Text>
        </View>
        <View style={styles.timeDateContainer}>
          <Text
            style={styles.secondaryTextSm}
            testID={testID ? `${testID}-date` : undefined}
          >
            {dateFormat(item?.createdAt)}
          </Text>
          <Text style={styles.secondaryTextSm}>{getTime(item?.createdAt)}</Text>
        </View>
      </View>
      {item?.user?.name && (
        <View style={styles.innerRow}>
          <Text
            style={styles.secondaryText}
            testID={testID ? `${testID}-name` : undefined}
          >
            {item?.user?.name}
          </Text>
        </View>
      )}
      {item?.user?.email && (
        <View style={styles.innerRow}>
          <Text
            style={styles.secondaryText}
            testID={testID ? `${testID}-email` : undefined}
          >
            {item?.user?.email}
          </Text>
        </View>
      )}
      <View style={styles.innerRow}>
        <Text
          style={styles.secondaryText}
          testID={testID ? `${testID}-quantity` : undefined}
        >
          Quantity : {quantity}
        </Text>
        <Text
          style={styles.secondaryText}
          testID={testID ? `${testID}-total` : undefined}
        >
          Total Amount : {totalCost}$
        </Text>
      </View>
      <View style={styles.paymentMetaContainer}>
        <Text
          style={styles.paymentMethodText}
          testID={testID ? `${testID}-payment-method` : undefined}
        >
          {getPaymentMethodLabel(item?.payment_type)}
        </Text>
        <PaymentStatusBadge
          paymentStatus={item?.payment_status}
          paymentType={item?.payment_type}
          testID={testID ? `${testID}-payment-status` : undefined}
        />
      </View>
      <View style={styles.innerRow}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={onPress}
          testID={testID ? `${testID}-details-btn` : undefined}
        >
          <Text>Details</Text>
        </TouchableOpacity>
        <Text
          style={styles.secondaryText}
          testID={testID ? `${testID}-status` : undefined}
        >
          {item?.status}
        </Text>
      </View>
    </View>
  );
};

export default OrderList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "auto",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  innerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  primaryText: {
    fontSize: 15,
    color: colors.dark,
    fontWeight: "bold",
  },
  secondaryTextSm: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "bold",
  },
  secondaryText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
  },
  timeDateContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  detailButton: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 5,
    borderColor: colors.muted,
    color: colors.muted,
    width: 100,
  },
  paymentMetaContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethodText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
});
