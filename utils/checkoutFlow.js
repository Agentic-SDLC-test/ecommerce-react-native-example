export function buildCheckoutPayload(cartItems, addressFields, paymentType) {
  const items = cartItems.map((product) => ({
    productId: product._id,
    price: Number(product.price),
    quantity: Number(product.quantity),
  }));

  const amount = items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  return {
    items,
    amount,
    discount: 0,
    payment_type: paymentType,
    country: addressFields.country.trim(),
    city: addressFields.city.trim(),
    zipcode: addressFields.zipcode.trim(),
    shippingAddress: addressFields.shippingAddress.trim(),
  };
}

export function hasRequiredShippingAddress(addressFields) {
  return [
    addressFields.country,
    addressFields.city,
    addressFields.zipcode,
    addressFields.shippingAddress,
  ].every((value) => String(value || "").trim() !== "");
}

export function getCheckoutSubmitLabel(paymentType) {
  return paymentType === "wallet" ? "Continue to Wallet" : "Submit Order";
}
