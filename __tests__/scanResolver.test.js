import { normalizeCode, classifyLookup } from "../utils/scanResolver";

describe("Scan resolver utilities", () => {
  describe("normalizeCode", () => {
    it("trims and upper-cases the scanned value", () => {
      expect(normalizeCode("  gar-001  ")).toBe("GAR-001");
      expect(normalizeCode("elc-002")).toBe("ELC-002");
    });

    it("handles null and undefined without throwing", () => {
      expect(normalizeCode(null)).toBe("");
      expect(normalizeCode(undefined)).toBe("");
    });

    it("coerces non-string values to a normalized string", () => {
      expect(normalizeCode(12345)).toBe("12345");
    });
  });

  describe("classifyLookup", () => {
    it("returns matched with the product and no matches on a unique match", () => {
      const product = { _id: "prod001", title: "Classic White T-Shirt", sku: "GAR-001" };
      const result = classifyLookup({ success: true, data: product });
      expect(result.outcome).toBe("matched");
      expect(result.product).toBe(product);
      expect(result.matches).toEqual([]);
    });

    it("returns not_found with no matches when data is null and there are no matches", () => {
      const result = classifyLookup({ success: true, data: null });
      expect(result.outcome).toBe("not_found");
      expect(result.product).toBeNull();
      expect(result.matches).toEqual([]);
    });

    it("returns ambiguous and passes the matches through when multiple products share the code", () => {
      const matches = [
        { _id: "prodA", title: "A", sku: "DUP-001" },
        { _id: "prodB", title: "B", sku: "DUP-001" },
      ];
      const result = classifyLookup({ success: true, data: null, matches });
      expect(result.outcome).toBe("ambiguous");
      expect(result.product).toBeNull();
      expect(result.matches).toBe(matches);
    });

    it("returns error with no matches when the response is missing or unsuccessful", () => {
      expect(classifyLookup(null).outcome).toBe("error");
      expect(classifyLookup(null).matches).toEqual([]);
      expect(classifyLookup(undefined).outcome).toBe("error");
      expect(classifyLookup({ success: false, message: "boom" }).outcome).toBe("error");
      expect(classifyLookup({ success: false, message: "boom" }).matches).toEqual([]);
    });
  });
});
