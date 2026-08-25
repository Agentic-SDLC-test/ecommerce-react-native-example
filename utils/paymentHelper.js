import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from "../constants/payment";

export const isValidPaymentMethod = (code) => {
  return PAYMENT_METHODS.some((m) => m.code === code);
};

export const resolvePaymentStatus = (paymentType) => {
  if (paymentType === "cod") {
    return PAYMENT_STATUSES.PAY_ON_DELIVERY;
  }
  if (paymentType === "wallet") {
    return PAYMENT_STATUSES.PAID;
  }
  return null;
};

export const buildCheckoutPayload = ({
  cartItems,
  addressFields,
  paymentType,
  paymentStatus,
  totalAmount,
}) => {
  const items = cartItems.map((product) => ({
    productId: product._id,
    price: product.price,
    quantity: product.quantity,
  }));

  return {
    items,
    amount: totalAmount,
    discount: 0,
    payment_type: paymentType,
    payment_status: paymentStatus,
    country: addressFields.country,
    city: addressFields.city,
    zipcode: addressFields.zipcode,
    shippingAddress: addressFields.streetAddress,
    status: "pending",
  };
};
