import { get, post } from "./client";

// The backend seam: named operations screens call instead of building fetch.
// Each returns the parsed response body ({ success, data / categories, message,
// err, ... }) so callers keep their existing success/error handling. Network
// failures reject, so existing .catch() handlers still fire.
//
// The same flat contract is served by both the Node backend and the
// mock-server, so these operations work against either target unchanged.

const q = (value) => encodeURIComponent(value);

// ---- Auth / users ----
export const register = (payload) => post("/register", payload);
export const login = (email, password) => post("/login", { email, password });
export const resetPassword = (userId, body) =>
  post(`/reset-password?id=${q(userId)}`, body);
export const deleteUser = (userId) => get(`/delete-user?id=${q(userId)}`);

// ---- Products ----
export const getProducts = (search) =>
  get(`/products${search ? `?search=${q(search)}` : ""}`);
export const createProduct = (payload) => post("/product", payload);
export const updateProduct = (id, payload) =>
  post(`/update-product?id=${q(id)}`, payload);
export const deleteProduct = (id) => get(`/delete-product?id=${q(id)}`);

// ---- Categories ----
export const getCategories = () => get("/categories");
export const createCategory = (payload) => post("/category", payload);
export const updateCategory = (id, payload) =>
  post(`/update-category?id=${q(id)}`, payload);
export const deleteCategory = (id) => get(`/delete-category?id=${q(id)}`);

// ---- Orders ----
// checkout payload.payment_type: "cod" | "card" (card PAN/CVV must not be sent).
// Response data includes payment_status: "cod_pending" | "paid" (and may include
// "pending" | "failed" on older or future records).
export const checkout = (payload) => post("/checkout", payload);
export const getOrders = () => get("/orders");
export const getAdminOrders = () => get("/admin/orders");
export const updateOrderStatus = (orderId, status) =>
  get(`/admin/order-status?orderId=${q(orderId)}&status=${q(status)}`);

// ---- Reviews ----
export const getProductReviewBundle = (productId) => {
  if (!productId) {
    return Promise.reject(new Error("productId is required"));
  }
  return get(`/product-reviews?productId=${q(productId)}`);
};

export const saveReview = (payload) => post("/review", payload);

export const getAdminReviews = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.productId) params.append("productId", filters.productId);
  if (filters.visibility) params.append("visibility", filters.visibility);
  if (filters.search) params.append("search", filters.search);

  const query = params.toString();
  return get(`/admin/reviews${query ? `?${query}` : ""}`);
};

export const updateReviewVisibility = (reviewId, visibility) =>
  get(
    `/admin/review-visibility?id=${q(reviewId)}&visibility=${q(visibility)}`
  );

export const removeReview = (reviewId) =>
  get(`/admin/delete-review?id=${q(reviewId)}`);

// ---- Wishlist ----
export const getWishlist = () => get("/wishlist");
export const addToWishlist = (productId, quantity = 1) =>
  post("/add-to-wishlist", { productId, quantity });
export const removeFromWishlist = (productId) =>
  get(`/remove-from-wishlist?id=${q(productId)}`);

// ---- Admin ----
export const getDashboard = () => get("/dashboard");
export const getUsers = () => get("/admin/users");

// ---- Uploads ----
export const uploadPhoto = (formData) => post("/photos/upload", formData);

// Re-export the base-URL resolver so screens can build image URLs through
// the same seam that decides where the backend lives.
export { getBaseUrl, imageUrl } from "./config";
