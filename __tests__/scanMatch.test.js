import { normalizeScannedCode, matchProductByCode } from "../utils/scanMatch";

const products = [
  { _id: "prod001", title: "Classic White T-Shirt", sku: "GAR-001" },
  { _id: "prod002", title: "Running Shoes", sku: "SHO-014" },
];

describe("scanMatch utilities", () => {
  describe("normalizeScannedCode", () => {
    it("trims and returns a plain code unchanged", () => {
      expect(normalizeScannedCode("  GAR-001 ")).toBe("GAR-001");
    });

    it("extracts the last path segment from a product URL", () => {
      expect(normalizeScannedCode("https://shop.easybuy.com/products/GAR-001")).toBe(
        "GAR-001"
      );
      expect(normalizeScannedCode("https://shop.easybuy.com/products/GAR-001/")).toBe(
        "GAR-001"
      );
    });

    it("prefers a sku/id query param in a URL", () => {
      expect(normalizeScannedCode("https://shop.easybuy.com/p?sku=GAR-001")).toBe(
        "GAR-001"
      );
      expect(normalizeScannedCode("https://shop.easybuy.com/p?id=prod001&x=1")).toBe(
        "prod001"
      );
    });

    it("strips a sku:/id: scheme prefix", () => {
      expect(normalizeScannedCode("sku:GAR-001")).toBe("GAR-001");
      expect(normalizeScannedCode("id:prod001")).toBe("prod001");
    });

    it("returns an empty string for nullish or blank input", () => {
      expect(normalizeScannedCode(null)).toBe("");
      expect(normalizeScannedCode(undefined)).toBe("");
      expect(normalizeScannedCode("   ")).toBe("");
    });
  });

  describe("matchProductByCode", () => {
    it("matches on sku case-insensitively", () => {
      expect(matchProductByCode(products, "gar-001")._id).toBe("prod001");
      expect(matchProductByCode(products, "GAR-001")._id).toBe("prod001");
    });

    it("matches a QR-encoded product URL by sku", () => {
      expect(
        matchProductByCode(products, "https://shop.easybuy.com/products/SHO-014")._id
      ).toBe("prod002");
    });

    it("falls back to _id when no sku matches", () => {
      expect(matchProductByCode(products, "prod002").sku).toBe("SHO-014");
    });

    it("returns null for an unknown code", () => {
      expect(matchProductByCode(products, "UNKNOWN-999")).toBeNull();
    });

    it("returns null for empty code or a non-array catalog", () => {
      expect(matchProductByCode(products, "")).toBeNull();
      expect(matchProductByCode(null, "GAR-001")).toBeNull();
    });
  });
});
