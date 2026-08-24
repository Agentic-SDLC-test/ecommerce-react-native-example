// Pure helpers for the scan-to-product flow. No I/O — the screen owns the
// camera and the API call; this module only normalizes the scanned value and
// classifies an already-parsed lookup response. Unit-tested the same way
// utils/reviewHelper.js is (see __tests__/scanResolver.test.js).

// normalize a raw scanned value before comparing it against catalog SKUs
export const normalizeCode = (raw) => String(raw ?? "").trim().toUpperCase();

// classify a parsed /products/lookup response into a scan outcome.
// outcome is one of: "matched" | "not_found" | "ambiguous" | "error".
// product is set only when outcome === "matched"; matches carries the
// candidate products only when outcome === "ambiguous" (empty otherwise) so
// the screen can render the chooser without re-reading the raw response.
export const classifyLookup = (result) => {
  if (!result || !result.success) {
    return { outcome: "error", product: null, matches: [] };
  }
  if (result.data) {
    return { outcome: "matched", product: result.data, matches: [] };
  }
  if (result.matches && result.matches.length > 1) {
    return { outcome: "ambiguous", product: null, matches: result.matches };
  }
  return { outcome: "not_found", product: null, matches: [] };
};
