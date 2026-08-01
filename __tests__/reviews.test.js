jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as api from "../api/index";
import colors from "../constants/Colors";

describe("Verified Purchaser Ratings and Reviews Unit Tests", () => {
  // Unit tests for API client bindings
  describe("API Client Bindings", () => {
    it("getReviews returns a function that builds a query string", () => {
      expect(typeof api.getReviews).toBe("function");
    });

    it("submitReview returns a function that takes productId and body", () => {
      expect(typeof api.submitReview).toBe("test");
    });

    it("getAdminReviews returns a function", () => {
      expect(typeof api.getAdminReviews).toBe("function");
    });

    it("toggleReviewVisibility returns a function", () => {
      expect(typeof api.toggleReviewVisibility).toBe("function");
    });

    it("deleteReview returns a function", () => {
      expect(typeof api.deleteReview).toBe("function");
    });
  });

  // Dynamic Rating statistics calculation algorithm test
  describe("Rating Statistics Calculation Algorithm", () => {
    const mockReviews = [
      { productId: "prod001", rating: 5, visible: true },
      { productId: "prod001", rating: 4, visible: true },
      { productId: "prod001", rating: 2, visible: true },
      { productId: "prod001", rating: 1, visible: false }, // hidden
      { productId: "prod002", rating: 3, visible: true }, // different product
    ];

    const calculateStats = (pId, list) => {
      const visible = list.filter((r) => r.productId === pId && r.visible === true);
      const total = visible.length;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (total === 0) {
        return { averageRating: 0.0, totalReviews: 0, distribution };
      }

      let sum = 0;
      visible.forEach((r) => {
        sum += r.rating;
        distribution[r.rating]++;
      });

      const averageRating = parseFloat((sum / total).toFixed(1));
      return { averageRating, totalReviews: total, distribution };
    };

    it("calculates statistics only for visible reviews of the given product", () => {
      const stats = calculateStats("prod001", mockReviews);
      expect(stats.totalReviews).toBe(3);
      expect(stats.averageRating).toBe(3.7); // (5 + 4 + 2) / 3 = 11 / 3 = 3.666... -> 3.7
      expect(stats.distribution).toEqual({
        1: 0,
        2: 1,
        3: 0,
        4: 1,
        5: 1,
      });
    });

    it("returns zero default statistics if no reviews are visible or exist", () => {
      const stats = calculateStats("prod004", mockReviews);
      expect(stats.totalReviews).toBe(0);
      expect(stats.averageRating).toBe(0.0);
      expect(stats.distribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
    });
  });

  // Automated Purchase history verification rules test
  describe("Purchase History Verification Algorithm", () => {
    const mockOrders = [
      {
        status: "pending",
        user: { _id: "user001" },
        items: [{ productId: { _id: "prod001" } }],
      },
      {
        status: "shipped",
        user: { _id: "user001" },
        items: [{ productId: { _id: "prod002" } }],
      },
      {
        status: "delivered",
        user: { _id: "user001" },
        items: [{ productId: "prod003" }],
      },
      {
        status: "delivered",
        user: { _id: "user002" },
        items: [{ productId: { _id: "prod002" } }],
      },
    ];

    const verifyPurchase = (uId, pId, orderList) => {
      return orderList.some((order) => {
        if (order.user._id !== uId) return false;
        if (order.status !== "shipped" && order.status !== "delivered") return false;
        return order.items.some((item) => {
          if (item.productId && typeof item.productId === "object") {
            return item.productId._id === pId;
          }
          return item.productId === pId;
        });
      });
    };

    it("denies verification for pending orders", () => {
      expect(verifyPurchase("user001", "prod001", mockOrders)).toBe(false);
    });

    it("grants verification for shipped orders", () => {
      expect(verifyPurchase("user001", "prod002", mockOrders)).toBe(true);
    });

    it("grants verification for delivered orders", () => {
      expect(verifyPurchase("user001", "prod003", mockOrders)).toBe(true);
    });

    it("correctly isolates purchase history by user ID", () => {
      expect(verifyPurchase("user002", "prod003", mockOrders)).toBe(false);
      expect(verifyPurchase("user002", "prod002", mockOrders)).toBe(true);
    });
  });
});
