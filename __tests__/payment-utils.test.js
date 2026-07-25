import { buildCheckoutPayload } from "../utils/checkout";
import {
  getOrderConfirmationCopy,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  isMockWalletEnabled,
} from "../utils/payment";

describe("payment helpers", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ENABLE_MOCK_WALLET;
  });

  it("builds a COD checkout payload with pay on delivery status", () => {
    const payload = buildCheckoutPayload(
      [{ _id: "prod001", price: 19.99, quantity: 2 }],
      {
        country: "Canada",
        city: "Toronto",
        zipcode: "M5V 3A8",
        shippingAddress: "123 Main Street",
      },
      "cod"
    );

    expect(payload).toMatchObject({
      amount: 39.98,
      payment_type: "cod",
      payment_status: "pay_on_delivery",
      status: "pending",
      country: "Canada",
      city: "Toronto",
    });
    expect(payload.items).toEqual([
      { productId: "prod001", price: 19.99, quantity: 2 },
    ]);
  });

  it("builds a wallet checkout payload with pending payment status", () => {
    const payload = buildCheckoutPayload(
      [{ _id: "prod001", price: 10, quantity: 1 }],
      {
        country: "Canada",
        city: "Montreal",
        zipcode: "H2Y 1C6",
        shippingAddress: "12 Rue Example",
      },
      "wallet"
    );

    expect(payload.payment_type).toBe("wallet");
    expect(payload.payment_status).toBe("pending");
    expect(payload.amount).toBe(10);
  });

  it("returns the expected payment labels and confirmation copy", () => {
    expect(getPaymentMethodLabel("wallet")).toBe("EasyBuy Wallet");
    expect(getPaymentStatusLabel("failed")).toBe("Payment failed");
    expect(getOrderConfirmationCopy("pending")).toEqual(
      expect.objectContaining({
        heading: "Order saved while payment is pending",
      })
    );
  });

  it("keeps the wallet feature disabled until explicitly enabled", () => {
    expect(isMockWalletEnabled()).toBe(false);

    process.env.EXPO_PUBLIC_ENABLE_MOCK_WALLET = "true";

    expect(isMockWalletEnabled()).toBe(true);
  });
});
