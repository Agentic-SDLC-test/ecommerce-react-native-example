import React from "react";
import { Platform } from "react-native";
import renderer, { act } from "react-test-renderer";
import ScanScreen from "../screens/user/ScanScreen";

let mockPermission = { granted: true, canAskAgain: true };
const mockRequestPermission = jest.fn();
jest.mock("expo-camera", () => {
  const ReactLib = require("react");
  return {
    CameraView: (props) => ReactLib.createElement("CameraView", props, props.children),
    useCameraPermissions: () => [mockPermission, mockRequestPermission],
  };
});

jest.mock("../api", () => ({
  getProductByCode: jest.fn(),
}));
import * as api from "../api";

const navigation = { goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn() };

const findByTestID = (tree, id) =>
  tree.root.findAll(
    (node) => typeof node.type === "string" && node.props && node.props.testID === id
  );

const originalPlatform = Platform.OS;

describe("ScanScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermission = { granted: true, canAskAgain: true };
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it("renders the web-unsupported panel with a search fallback", () => {
    Platform.OS = "web";
    let tree;
    act(() => {
      tree = renderer.create(<ScanScreen navigation={navigation} />);
    });
    expect(findByTestID(tree, "scan-web-unsupported").length).toBe(1);
    expect(findByTestID(tree, "scan-back-to-search").length).toBe(1);
  });

  it("renders the permission-denied panel with grant + fallback buttons", () => {
    mockPermission = { granted: false, canAskAgain: true };
    let tree;
    act(() => {
      tree = renderer.create(<ScanScreen navigation={navigation} />);
    });
    expect(findByTestID(tree, "scan-permission-denied").length).toBe(1);
    expect(findByTestID(tree, "scan-allow-camera").length).toBe(1);
    expect(findByTestID(tree, "scan-back-to-search").length).toBe(1);
  });

  it("shows the not-found panel with next-step buttons on an unmatched scan", async () => {
    api.getProductByCode.mockResolvedValue({ success: true, data: null });
    let tree;
    act(() => {
      tree = renderer.create(<ScanScreen navigation={navigation} />);
    });
    const camera = tree.root.findByProps({ testID: "scan-camera-view" });
    await act(async () => {
      await camera.props.onBarcodeScanned({ data: "UNKNOWN-999" });
    });
    expect(findByTestID(tree, "scan-not-found").length).toBe(1);
    expect(findByTestID(tree, "scan-scan-again").length).toBe(1);
    expect(findByTestID(tree, "scan-back-to-search").length).toBe(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("navigates to product detail on a matched scan", async () => {
    const product = { _id: "prod001", sku: "GAR-001" };
    api.getProductByCode.mockResolvedValue({ success: true, data: product });
    let tree;
    act(() => {
      tree = renderer.create(<ScanScreen navigation={navigation} />);
    });
    const camera = tree.root.findByProps({ testID: "scan-camera-view" });
    await act(async () => {
      await camera.props.onBarcodeScanned({ data: "GAR-001" });
    });
    expect(navigation.navigate).toHaveBeenCalledWith("productdetail", { product });
  });
});
