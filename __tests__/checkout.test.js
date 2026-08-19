const {
  derivePaymentStatus,
  stripCardFieldsFromBody,
} = require("../mock-server/checkoutUtils");

describe("mock-server checkout utils", () => {
  describe("derivePaymentStatus", () => {
    it("maps cod to cod_pending", () => {
      expect(derivePaymentStatus("cod")).toBe("cod_pending");
    });

    it("maps card to paid", () => {
      expect(derivePaymentStatus("card")).toBe("paid");
    });

    it("returns null for unsupported payment types", () => {
      expect(derivePaymentStatus("wallet")).toBeNull();
    });
  });

  describe("stripCardFieldsFromBody", () => {
    it("removes card fields and reports presence", () => {
      const body = {
        items: [{ productId: "prod001", price: 10, quantity: 1 }],
        payment_type: "card",
        cardNumber: "4111111111111111",
        cvv: "123",
      };
      expect(stripCardFieldsFromBody(body)).toBe(true);
      expect(body.cardNumber).toBeUndefined();
      expect(body.cvv).toBeUndefined();
      expect(body.payment_type).toBe("card");
    });

    it("returns false when no card fields are present", () => {
      const body = { payment_type: "cod", items: [] };
      expect(stripCardFieldsFromBody(body)).toBe(false);
    });
  });
});
