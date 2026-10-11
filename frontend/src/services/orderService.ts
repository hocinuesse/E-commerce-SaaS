import api from "@/lib/api";

const orderService = {
  createOrder: async (orderData: any) => {
    try {
      const response = await api.post("/orders/create-order", orderData);
      console.log("succusfuly add order", response.data.data.orders);

      return response.data.data.order;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to create order");
      throw new Error(error.response.data.message || "failed to create order");
    }
  },

  getUserOrders: async () => {
    try {
      const response = await api.get("/orders/user-orders");
      return response.data.data.orders;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get user orders");
      throw new Error(
        error.response.data.message || "failed to get user orders",
      );
    }
  },

  getShopOrders: async () => {
    try {
      const response = await api.get("/orders/shop-orders");
      return response.data.data.orders;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get shop orders");
      throw new Error(
        error.response.data.message || "failed to get shop orders",
      );
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.patch(
        `/orders/update-order-status/${orderId}`,
        { status },
      );
      return response.data.data.order;
    } catch (error: Error | any) {
      console.log(
        error.response.data.message || "failed to update order status",
      );
      throw new Error(
        error.response.data.message || "failed to update order status",
      );
    }
  },

  getShopInfo: async (id: string) => {
    try {
      const response = await api.get(`/shops/shop-id/${id}`);
      return response.data.data.shop;
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to get shop info");
      throw new Error(error.response.data.message || "failed to get shop info");
    }
  },
};

export default orderService;
