import { createClient } from "@agentic-sdlc-test/easybuy-api-client";
import { getBaseUrl } from "./config";
import * as session from "../utils/session";
import { resetToLogin } from "../routes/navigationRef";

const client = createClient({
  baseUrl: getBaseUrl(),
  getToken: () => session.getToken(),
  onUnauthorized: async () => {
    await session.clearSession();
    resetToLogin();
  },
});

export const register = client.register;
export const login = client.login;
export const resetPassword = client.resetPassword;
export const deleteUser = client.deleteUser;
export const getProducts = client.getProducts;
export const createProduct = client.createProduct;
export const updateProduct = client.updateProduct;
export const deleteProduct = client.deleteProduct;
export const getCategories = client.getCategories;
export const createCategory = client.createCategory;
export const updateCategory = client.updateCategory;
export const deleteCategory = client.deleteCategory;
export const checkout = client.checkout;
export const getOrders = client.getOrders;
export const getAdminOrders = client.getAdminOrders;
export const updateOrderStatus = client.updateOrderStatus;
export const getWishlist = client.getWishlist;
export const addToWishlist = client.addToWishlist;
export const removeFromWishlist = client.removeFromWishlist;
export const getDashboard = client.getDashboard;
export const getUsers = client.getUsers;
export const uploadPhoto = client.uploadPhoto;
export const imageUrl = (filename) => client.imageUrl(filename);

export { getBaseUrl };
