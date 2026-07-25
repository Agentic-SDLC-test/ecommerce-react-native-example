import { isDigitalPaymentType } from "./payment";

export const buildCheckoutPayload = (
  cartItems,
  { country, city, zipcode, shippingAddress },
  paymentType = "cod"
) => {
  const normalizedPaymentType = isDigitalPaymentType(paymentType)
    ? "wallet"
    : "cod";

  const items = cartItems.map((product) => ({
    productId: product._id,
    price: product.price,
    quantity: product.quantity,
  }));

  const amount = cartItems.reduce(
    (accumulator, product) =>
      accumulator + Number(product.price) * Number(product.quantity),
    0
  );

  return {
    items,
    amount,
    discount: 0,
    payment_type: normalizedPaymentType,
    payment_status: normalizedPaymentType === "wallet" ? "pending" : "pay_on_delivery",
    country,
    city,
    zipcode,
    shippingAddress,
    status: "pending",
  };
};
