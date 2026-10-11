import api from "../lib/api";
import { StoreSettings } from "@/interfaces/ISettings";

const vendorService = {
  createShop: async (shopData: any) => {
    try {
      const response = await api.post("/shops/create-shop", shopData);
      return response.data.data.shop;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to create shop");
      throw new Error(error.response.data.message || "failed to create shop");
    }
  },

  getMyShop: async () => {
    try {
      const response = await api.get("/shops/my-shop");
      return response.data.data.shop || null;
    } catch (error: Error | any) {
      console.log(
        error.response.data.message || error.message || "failed to get my shop",
      );
      throw new Error(error.response.data.message || "failed to get my shop");
    }
  },

  getShopBySlug: async (slug: string) => {
    try {
      const response = await api.get(`shops/shop/${slug}`);
      return response.data.data || null;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get shop by slug");
      throw new Error(
        error.response.data.message || "failed to get shop by slug",
      );
    }
  },

  getAllShops: async () => {
    try {
      const response = await api.get("shops/all-shops");
      return response.data.data.shops;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get all shops");
      throw new Error(error.response.data.message || "failed to get all shops");
    }
  },

  getTotalSales: async (shopId: string) => {
    try {
      const response = await api.post("/shops/total-sales-report", {
        shopId,
      });

      return response.data.data;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get total sales");
      throw new Error(
        error.response.data.message || "failed to get total sales",
      );
    }
  },

  viewCount: async (shopSlug: string) => {
    try {
      const response = await api.post(`/shops/view-count/${shopSlug}`);
      return response.data.data.viewCount;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get view count");
      throw new Error(
        error.response.data.message || "failed to get view count",
      );
    }
  },

  monthlySalesReport: async (shopId: string) => {
    try {
      const response = await api.post("/shops/monthly-sales-report", {
        shopId,
      });
      console.log(response.data.data);

      return response.data.data;
    } catch (error: Error | any) {
      console.log(
        error.response.data.message || "failed to get monthly sales report",
      );
      throw new Error(
        error.response.data.message || "failed to get monthly sales report",
      );
    }
  },

  updateSettings: async (shopId: string, settingsData: any) => {
    try {
      const response = await api.patch(`/shops/update-shop-settings/${shopId}`, settingsData);
      return response.data.data.shop;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to update settings");
      throw new Error(error.response.data.message || "failed to update settings");
    }
  },

  addReview: async (shopId: string, reviewData: any) => {
    try {
      const response = await api.post(`/shops/add-review/${shopId}`, reviewData);
      return response.data.data.review;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to add review");
      throw new Error(error.response.data.message || "failed to add review");
    }
  },

  getReviews: async (shopId: string) => {
    try {
      const response = await api.get(`/shops/shop-reviews/${shopId}`);
      return response.data.data.reviews;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get reviews");
      throw new Error(error.response.data.message || "failed to get reviews");
    }
  },

  getTopShops: async (limit: number = 10) => {
    try {
      const response = await api.get(`/admin/best-sellers?limit=${limit}`);
      return response.data.data.bestSellers || [];
    } catch (error: Error | any) {
      return [];
    }
  },
};

export default vendorService;
