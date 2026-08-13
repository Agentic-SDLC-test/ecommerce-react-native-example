import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import RatingStars from "../Reviews/RatingStars";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const date = ("0" + d.getDate()).slice(-2);
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const year = d.getFullYear();
  return `${date}-${month}-${year}`;
};

const ReviewList = ({
  item,
  onPressHide,
  onPressToggleVisibility,
  onPressRemove,
  testID,
}) => {
  const isRemoved = item?.removed || item?.moderationStatus === "removed";
  const statusLabel = isRemoved
    ? "Removed"
    : item?.hidden
      ? "Hidden"
      : "Visible";

  return (
    <View
      style={[styles.container, isRemoved && styles.removedContainer]}
      testID={testID}
    >
      <View style={styles.headerRow}>
        <Text style={styles.productText} testID={testID ? `${testID}-product` : undefined}>
          {item?.product?.title}
        </Text>
        <Text
          style={[
            styles.statusText,
            isRemoved && styles.removedStatus,
            item?.hidden && !isRemoved && styles.hiddenStatus,
          ]}
          testID={testID ? `${testID}-status` : undefined}
        >
          {statusLabel}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.reviewerText} testID={testID ? `${testID}-reviewer` : undefined}>
          {item?.user?.name}
        </Text>
        <Text style={styles.dateText}>{formatDate(item?.updatedAt)}</Text>
      </View>
      <RatingStars rating={item?.rating || 0} size={14} />
      <Text style={styles.commentPreview} numberOfLines={2} testID={testID ? `${testID}-comment` : undefined}>
        {item?.comment}
      </Text>
      {!isRemoved && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onPressHide(item._id)}
            testID={testID ? `${testID}-hide-btn` : undefined}
          >
            <Ionicons name="eye-off-outline" size={18} color={colors.muted} />
            <Text style={styles.actionText}>Hide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onPressToggleVisibility(item._id, !item.visible)}
            testID={testID ? `${testID}-visibility-btn` : undefined}
          >
            <Ionicons
              name={item.visible ? "eye-off" : "eye"}
              size={18}
              color={colors.primary}
            />
            <Text style={styles.actionText}>
              {item.visible ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onPressRemove(item._id)}
            testID={testID ? `${testID}-remove-btn` : undefined}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  removedContainer: {
    opacity: 0.6,
    backgroundColor: colors.light,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    flex: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.info,
  },
  hiddenStatus: {
    color: colors.warning,
  },
  removedStatus: {
    color: colors.danger,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 11,
    color: colors.muted,
  },
  commentPreview: {
    fontSize: 12,
    color: colors.dark,
    marginTop: 4,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.muted,
  },
});
