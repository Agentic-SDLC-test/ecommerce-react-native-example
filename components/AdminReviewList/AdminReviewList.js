import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { colors } from "../../constants";

const AdminReviewList = ({ item, onToggleVisibility, onRemove, testID }) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const handleRemovePress = () => {
    if (confirmingRemove) {
      setConfirmingRemove(false);
      onRemove(item);
    } else {
      setConfirmingRemove(true);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.productTitle} testID={testID ? `${testID}-product-title` : undefined}>
          {item?.productTitle}
        </Text>
        <View
          style={[
            styles.statusPill,
            item?.status === "visible" ? styles.statusVisible : styles.statusHidden,
          ]}
          testID={testID ? `${testID}-status` : undefined}
        >
          <Text style={styles.statusText}>
            {item?.status === "visible" ? "Visible" : "Hidden"}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewerName} testID={testID ? `${testID}-reviewer` : undefined}>
        {item?.userName}
      </Text>
      <Text style={styles.ratingText} testID={testID ? `${testID}-rating` : undefined}>
        {"★".repeat(item?.rating || 0)}
        {"☆".repeat(5 - (item?.rating || 0))}
      </Text>
      {item?.text ? (
        <Text style={styles.reviewText} testID={testID ? `${testID}-text` : undefined}>
          {item.text}
        </Text>
      ) : null}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onToggleVisibility(item)}
          testID={testID ? `${testID}-toggle-btn` : undefined}
        >
          <Text style={styles.actionText}>
            {item?.status === "visible" ? "Hide" : "Unhide"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRemovePress}
          testID={testID ? `${testID}-remove-btn` : undefined}
        >
          <Text style={styles.actionTextDanger}>
            {confirmingRemove ? "Confirm remove?" : "Remove"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AdminReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusVisible: {
    backgroundColor: colors.success,
  },
  statusHidden: {
    backgroundColor: colors.muted,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.dark,
  },
  reviewerName: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  reviewText: {
    fontSize: 13,
    color: colors.dark,
    marginTop: 6,
  },
  actionsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  actionTextDanger: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
  },
});
