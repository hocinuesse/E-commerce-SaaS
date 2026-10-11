import api from "@/lib/api";


const adminService = {
  getAllStores: async () => {
    try {
      const response = await api.get("/admin/shops");
      return response.data.data;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to get all stores");
      throw new Error(
        error.response?.data?.message || "failed to get all stores",
      );
    }
  },

  updateShopStatus: async (shopId: string, status: string) => {
    try {
      const response = await api.patch(`/admin/shops/${shopId}/status`, {
        status,
      });
      return response.data.data.shop;
    } catch (error: Error | any) {
      console.log(
        error.response?.data?.message || "failed to update store status",
      );
      throw new Error(
        error.response?.data?.message || "failed to update store status",
      );
    }
  },

  getShopDetails: async (shopId: string) => {
    try {
      const response = await api.get(`/admin/shops/${shopId}`);
      return response.data.data.shop;
    } catch (error: Error | any) {
      console.log(
        error.response?.data?.message || "failed to get store details",
      );
      throw new Error(
        error.response?.data?.message || "failed to get store details",
      );
    }
  },

  totalUsers: async () => {
    try {
      const response = await api.get("/admin/users");
      return response.data.data.totalUsers;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to get total users");
      throw new Error(error.response?.data?.message || "failed to get total users");
    }
  },

  totalOrders: async () => {
    try {
      const response = await api.get("/admin/orders");
      return response.data.data.totalOrders;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to get total orders");
      throw new Error(error.response?.data?.message || "failed to get total orders");
    }
  },
};

export default adminService;
