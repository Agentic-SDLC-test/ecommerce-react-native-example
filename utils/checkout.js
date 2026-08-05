export function hasCompleteAddress({
  country = "",
  city = "",
  zipcode = "",
  shippingAddress = "",
}) {
  return [country, city, zipcode, shippingAddress].every((value) =>
    String(value || "").trim()
  );
}

export function getAddressSummary({ country = "", city = "", shippingAddress = "" }) {
  return [shippingAddress, city, country].filter(Boolean).join(", ");
}

export function buildCheckoutPayload({
  cartItems,
  selectedPaymentType,
  paymentAcknowledged = false,
  country = "",
  city = "",
  zipcode = "",
  shippingAddress = "",
}) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  if (!selectedPaymentType) {
    throw new Error("Select a payment method");
  }

  if (
    !hasCompleteAddress({
      country,
      city,
      zipcode,
      shippingAddress,
    })
  ) {
    throw new Error("Add a shipping address before checkout");
  }

  const items = cartItems.map((product) => ({
    productId: product._id,
    price: product.price,
    quantity: product.quantity,
  }));

  const amount = cartItems.reduce(
    (accumulator, product) => accumulator + Number(product.price) * Number(product.quantity),
    0
  );

  return {
    items,
    amount,
    discount: 0,
    payment_type: selectedPaymentType,
    payment_acknowledged: selectedPaymentType === "wallet_mock" ? Boolean(paymentAcknowledged) : false,
    country: String(country).trim(),
    city: String(city).trim(),
    zipcode: String(zipcode).trim(),
    shippingAddress: String(shippingAddress).trim(),
  };
}
