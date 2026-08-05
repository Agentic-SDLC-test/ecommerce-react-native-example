import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import RatingStars from "../Reviews/RatingStars";

const ReviewList = ({ item, onHide, onShow, onRemove, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.innerRow}>
        <Text style={styles.primaryText} testID={testID ? `${testID}-product` : undefined}>
          {item.productTitle}
        </Text>
        <RatingStars rating={item.rating} readonly size={14} testID={testID ? `${testID}-stars` : undefined} />
      </View>
      <View style={styles.innerRow}>
        <Text style={styles.secondaryText} testID={testID ? `${testID}-name` : undefined}>
          {item.userName}
        </Text>
        <Text style={styles.secondaryTextSm} testID={testID ? `${testID}-email` : undefined}>
          {item.userEmail}
        </Text>
      </View>
      {item.verifiedPurchase && (
        <Text style={styles.verifiedBadge} testID={testID ? `${testID}-verified` : undefined}>
          Verified Purchase
        </Text>
      )}
      <Text style={styles.reviewText} numberOfLines={2} testID={testID ? `${testID}-text` : undefined}>
        {item.reviewText}
      </Text>
      <View style={styles.innerRow}>
        <Text
          style={[styles.statusText, item.visible ? styles.visibleText : styles.hiddenText]}
          testID={testID ? `${testID}-visibility` : undefined}
        >
          {item.visible ? "Visible" : "Hidden"}
        </Text>
        <View style={styles.actions}>
          {item.visible ? (
            <TouchableOpacity
              onPress={() => onHide(item)}
              style={styles.actionButton}
              testID={testID ? `${testID}-hide-btn` : undefined}
            >
              <Ionicons name="eye-off-outline" size={20} color={colors.muted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onShow(item)}
              style={styles.actionButton}
              testID={testID ? `${testID}-show-btn` : undefined}
            >
              <Ionicons name="eye-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onRemove(item)}
            style={styles.actionButton}
            testID={testID ? `${testID}-remove-btn` : undefined}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
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
    marginBottom: 4,
  },
  primaryText: {
    fontSize: 15,
    color: colors.dark,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  secondaryText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "bold",
  },
  secondaryTextSm: {
    fontSize: 11,
    color: colors.muted,
  },
  verifiedBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 13,
    color: colors.dark,
    width: "100%",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  visibleText: {
    color: colors.success,
  },
  hiddenText: {
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
});
