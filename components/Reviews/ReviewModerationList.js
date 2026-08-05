import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { colors } from "../../constants";
import StarRating from "./StarRating";

const ReviewModerationList = ({
  item,
  onToggleVisibility,
  onRemove,
  testID,
}) => {
  const statusLabel = item.removed
    ? "Removed"
    : item.visible
      ? "Visible"
      : "Hidden";

  const statusColor = item.removed
    ? colors.danger
    : item.visible
      ? colors.success
      : colors.warning;

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.productTitle} testID={testID ? `${testID}-product` : undefined}>
          {item.product?.title || "Unknown Product"}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText} testID={testID ? `${testID}-status` : undefined}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.customerInfo} testID={testID ? `${testID}-customer` : undefined}>
        {item.user?.name} ({item.user?.email})
      </Text>
      <StarRating rating={item.rating} size={14} testID={testID ? `${testID}-stars` : undefined} />
      <Text style={styles.body} numberOfLines={3} testID={testID ? `${testID}-body` : undefined}>
        {item.body}
      </Text>
      {item.removedAt && (
        <Text style={styles.timestamp} testID={testID ? `${testID}-removed-at` : undefined}>
          Removed: {format(new Date(item.removedAt), "MMM d, yyyy")}
        </Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, item.removed && styles.actionBtnDisabled]}
          onPress={() => onToggleVisibility(item)}
          disabled={item.removed}
          testID={testID ? `${testID}-toggle` : undefined}
        >
          <Ionicons
            name={item.visible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={item.removed ? colors.muted : colors.primary}
          />
          <Text style={styles.actionText}>
            {item.visible ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, item.removed && styles.actionBtnDisabled]}
          onPress={() => onRemove(item._id)}
          disabled={item.removed}
          testID={testID ? `${testID}-remove` : undefined}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={item.removed ? colors.muted : colors.danger}
          />
          <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewModerationList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.white,
  },
  customerInfo: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: colors.dark,
    marginTop: 6,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 13,
    marginLeft: 4,
    color: colors.primary,
    fontWeight: "600",
  },
});
