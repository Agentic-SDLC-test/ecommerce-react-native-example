import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomButton from "../../components/CustomButton/CustomButton";
import { normalizeCode, classifyLookup } from "../../utils/scanResolver";

// Codes we read: QR plus the common retail 1D barcodes.
const BARCODE_TYPES = ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"];

const ScanScreen = ({ navigation }) => {
  const isWeb = Platform.OS === "web";
  const [permission, requestPermission] = useCameraPermissions();
  const [resolving, setResolving] = useState(false);
  const [notFound, setNotFound] = useState(null); // { code } when a scan matched nothing
  const [ambiguous, setAmbiguous] = useState(null); // { code, matches } when one code hits many products
  const [error, setError] = useState("");
  // single-flight latch: onBarcodeScanned can fire rapidly for the same frame,
  // so we ignore events while a lookup is in flight or an outcome is showing.
  const scanningLocked = useRef(false);

  // ask for camera permission once, on mount, when it is still undetermined
  useEffect(() => {
    console.log("scan_opened");
    if (!isWeb && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, []);

  // method called by the camera when a code is decoded
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanningLocked.current) return;
    scanningLocked.current = true;
    console.log("scan_code_read", { type });

    const code = normalizeCode(data);
    if (!code) {
      // empty/whitespace value: treat as not found without hitting the network
      setNotFound({ code: data });
      return;
    }

    setResolving(true);
    api
      .getProductByCode(code)
      .then((result) => {
        const { outcome, product, matches } = classifyLookup(result);
        console.log("scan_lookup_result", { outcome });
        setResolving(false);
        if (outcome === "matched") {
          navigation.navigate("productdetail", { product });
        } else if (outcome === "ambiguous") {
          // one code, several products: let the shopper pick the right one
          setAmbiguous({ code, matches });
        } else if (outcome === "error") {
          setError(result && result.message ? result.message : "Something went wrong while looking up that code.");
        } else {
          setNotFound({ code });
        }
      })
      .catch((err) => {
        setResolving(false);
        setError(err.message);
        console.log("scan_error", { message: err.message });
      });
  };

  // method to re-arm the scanner after a not-found / ambiguous / error outcome
  const handleScanAgain = () => {
    setNotFound(null);
    setAmbiguous(null);
    setError("");
    setResolving(false);
    scanningLocked.current = false;
  };

  // method to open a product's detail from the ambiguous chooser (same
  // navigation contract as the unique-match branch)
  const handlePickMatch = (product) => {
    navigation.navigate("productdetail", { product });
  };

  // method to leave the scanner and return to the home search bar
  const handleGoToSearch = () => {
    navigation.goBack();
  };

  // method to open the OS settings when permission was permanently denied
  const openSettings = () => {
    Linking.openSettings();
  };

  // ---- render branches ----

  // web has no camera scanner: offer a graceful fallback to search
  if (isWeb) {
    return (
      <View style={styles.messageContainer} testID="scan-web-unsupported">
        <Text style={styles.title}>Scanning isn&apos;t available here</Text>
        <Text style={styles.body}>Use search to find your product instead.</Text>
        <View style={styles.actions}>
          <CustomButton text="Back to search" onPress={handleGoToSearch} testID="scan-back-to-search" />
        </View>
      </View>
    );
  }

  // permission state still loading
  if (!permission) {
    return (
      <View style={styles.messageContainer} testID="scan-permission-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // permission denied: explain and offer working alternatives
  if (!permission.granted) {
    console.log("scan_permission_denied");
    return (
      <View style={styles.messageContainer} testID="scan-permission-denied">
        <Text style={styles.title}>Camera access is needed to scan</Text>
        <Text style={styles.body}>
          Allow camera access to scan a barcode or QR code, or use search instead.
        </Text>
        <View style={styles.actions}>
          {permission.canAskAgain ? (
            <CustomButton text="Allow camera" onPress={requestPermission} testID="scan-allow-camera" />
          ) : (
            <CustomButton text="Open settings" onPress={openSettings} testID="scan-open-settings" />
          )}
          <CustomButton text="Back to search" onPress={handleGoToSearch} testID="scan-back-to-search" />
        </View>
      </View>
    );
  }

  // one code maps to several products: let the shopper choose which to open
  if (ambiguous) {
    return (
      <View style={styles.messageContainer} testID="scan-ambiguous">
        <Text style={styles.title}>Multiple products match</Text>
        <Text style={styles.body}>More than one product matches:</Text>
        <Text style={styles.code} testID="scan-ambiguous-code">{String(ambiguous.code)}</Text>
        <View style={styles.matchList}>
          {ambiguous.matches.map((m) => (
            <TouchableOpacity
              key={m._id}
              style={styles.matchRow}
              onPress={() => handlePickMatch(m)}
              testID={`scan-ambiguous-match-${m._id}`}
            >
              <Text style={styles.matchTitle}>{m.title}</Text>
              <Text style={styles.matchSku}>{m.sku}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actions}>
          <CustomButton text="Scan again" onPress={handleScanAgain} testID="scan-scan-again" />
          <CustomButton text="Back to search" onPress={handleGoToSearch} testID="scan-back-to-search" />
        </View>
      </View>
    );
  }

  // no match: show the scanned value verbatim with next steps
  if (notFound) {
    return (
      <View style={styles.messageContainer} testID="scan-not-found">
        <Text style={styles.title}>No product found</Text>
        <Text style={styles.body}>
          We couldn&apos;t find a product for:
        </Text>
        <Text style={styles.code} testID="scan-not-found-code">{String(notFound.code)}</Text>
        <View style={styles.actions}>
          <CustomButton text="Scan again" onPress={handleScanAgain} testID="scan-scan-again" />
          <CustomButton text="Back to search" onPress={handleGoToSearch} testID="scan-back-to-search" />
        </View>
      </View>
    );
  }

  // lookup error: let the shopper retry or fall back to search
  if (error) {
    return (
      <View style={styles.messageContainer} testID="scan-error">
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>{error}</Text>
        <View style={styles.actions}>
          <CustomButton text="Scan again" onPress={handleScanAgain} testID="scan-scan-again" />
          <CustomButton text="Back to search" onPress={handleGoToSearch} testID="scan-back-to-search" />
        </View>
      </View>
    );
  }

  // default: live camera preview
  return (
    <View style={styles.cameraContainer} testID="scan-camera">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={resolving ? undefined : handleBarcodeScanned}
        testID="scan-camera-view"
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.guidance} testID="scan-guidance">
          Point at a barcode or QR code
        </Text>
        {resolving ? (
          <ActivityIndicator size="large" color={colors.light} testID="scan-resolving" />
        ) : null}
        <TouchableOpacity style={styles.cancelButton} onPress={handleGoToSearch} testID="scan-cancel">
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  guidance: {
    color: colors.light,
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  cancelText: {
    color: colors.light,
    fontWeight: "bold",
    fontSize: 15,
  },
  messageContainer: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 12,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    marginTop: 20,
  },
  matchList: {
    width: "100%",
    marginTop: 8,
  },
  matchRow: {
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 6,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
  },
  matchSku: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
