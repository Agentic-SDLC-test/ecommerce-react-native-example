// Pure helpers for resolving a scanned barcode/QR payload to a catalog
// product. No I/O — matching runs client-side over the fetched catalog
// (see api.resolveProductByCode), so these stay unit-testable.

// Normalize a raw scanned string to the token we match against.
// - URL payloads (QR codes encoding a link): pull a `sku`/`id` query param
//   when present, otherwise the last non-empty path segment
//   (e.g. https://shop/products/GAR-001 -> "GAR-001").
// - `sku:`/`id:` scheme prefixes are stripped.
// - Nullish input returns "".
export const normalizeScannedCode = (raw) => {
  if (raw === null || raw === undefined) return "";
  const value = String(raw).trim();
  if (value === "") return "";

  // A URL requires a scheme with "://" — a bare "sku:GAR-001" is handled below.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    const queryMatch = value.match(/[?&](?:sku|id)=([^&#]+)/i);
    if (queryMatch) {
      return decodeURIComponent(queryMatch[1]).trim();
    }
    const withoutQuery = value.split(/[?#]/)[0];
    const segments = withoutQuery.split("/").filter((segment) => segment.length > 0);
    return segments.length > 0 ? segments[segments.length - 1] : "";
  }

  const prefixMatch = value.match(/^(?:sku|id):(.+)$/i);
  if (prefixMatch) return prefixMatch[1].trim();

  return value;
};

// Match precedence: case-insensitive `sku` exact match first, then `_id`
// exact match. Returns the first matching product or null.
export const matchProductByCode = (products, code) => {
  const norm = normalizeScannedCode(code);
  if (!norm || !Array.isArray(products)) return null;

  const lower = norm.toLowerCase();
  const bySku = products.find(
    (product) =>
      product && typeof product.sku === "string" && product.sku.toLowerCase() === lower
  );
  if (bySku) return bySku;

  const byId = products.find((product) => product && product._id === norm);
  return byId || null;
};
