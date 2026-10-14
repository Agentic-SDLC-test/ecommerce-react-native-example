import { Alert, Platform } from "react-native";

// method to ask for destructive-action confirmation, working on web too (Alert.alert is a no-op there)
export function confirmAction({ title, message, confirmText = "Remove" }) {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}: ${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmText,
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
