// resolveProductByCode composes the existing getProducts() fetch with the
// pure matcher. We stub the transport (api/client.get) so no network runs,
// and stub api/config (re-exported by api/index) to keep the module load
// free of native platform code under jest.
jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
jest.mock("../api/config", () => ({
  getBaseUrl: () => "http://localhost:3002",
  imageUrl: (name) => name,
}));

import { get } from "../api/client";
import { resolveProductByCode } from "../api";

const catalog = [
  { _id: "prod001", title: "Classic White T-Shirt", sku: "GAR-001" },
  { _id: "prod002", title: "Running Shoes", sku: "SHO-014" },
];

describe("resolveProductByCode", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("returns the matched product on a successful lookup", async () => {
    get.mockResolvedValue({ success: true, data: catalog });
    const result = await resolveProductByCode("GAR-001");
    expect(result).toEqual({ success: true, match: catalog[0] });
    expect(get).toHaveBeenCalledWith("/products");
  });

  it("returns match null when the code matches no product", async () => {
    get.mockResolvedValue({ success: true, data: catalog });
    const result = await resolveProductByCode("UNKNOWN-999");
    expect(result).toEqual({ success: true, match: null });
  });

  it("propagates a failed fetch without matching", async () => {
    get.mockResolvedValue({ success: false, message: "Server error" });
    const result = await resolveProductByCode("GAR-001");
    expect(result).toEqual({ success: false, message: "Server error" });
  });

  it("short-circuits an empty code without fetching", async () => {
    const result = await resolveProductByCode("   ");
    expect(result).toEqual({ success: false, match: null, message: "Empty code" });
    expect(get).not.toHaveBeenCalled();
  });
});
