/**
 * Build POST /checkout payload from cart, address, and payment choice.
 */
export function buildCheckoutPayload(cartItems, address, paymentType, paymentStatus) {
  const items = [];
  let amount = 0;
  (cartItems || []).forEach((product) => {
    items.push({
      productId: product._id,
      price: product.price,
      quantity: product.quantity,
    });
    amount += parseInt(product.price, 10) * parseInt(product.quantity, 10);
  });

  return {
    items,
    amount,
    discount: 0,
    payment_type: paymentType,
    payment_status: paymentStatus,
    country: address?.country || "",
    city: address?.city || "",
    zipcode: address?.zipcode || "",
    shippingAddress: address?.streetAddress || "",
    status: "pending",
  };
}
