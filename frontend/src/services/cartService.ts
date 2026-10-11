import api from "@/lib/api";

const cartService = {
  addToCart: async (productId: any, quantity: number, options?: any) => {
    try {
      const response = await api.post("/cart/add", { productId, quantity, options });
      return response.data.data ?? response.data;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to add to cart");
      throw new Error(error.response?.data?.message || "failed to add to cart");
    }
  },

  getCart: async () => {
    try {
      const response = await api.get("/cart");
      return response.data.data?.cart ?? response.data.data ?? response.data;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to get cart");
      throw new Error(error.response?.data?.message || "failed to get cart");
    }
  },
  getCartLength: async () => {
    try {
      const response = await api.get("/cart");
      return response.data.cartLength ?? 0;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to get cart length");
      throw new Error(error.response?.data?.message || "failed to get cart length");
    }
  },

  updateCartItem: async (action: string, productId: string) => {
    try {
      const response = await api.patch("/cart/update", { action, productId });
      return response.data.data?.cart ?? response.data.data ?? response.data;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to update cart item");
      throw new Error(error.response?.data?.message || "failed to update cart item");
    }
  },

  removeCartItem: async (productId: string) => {
    try {
      const response = await api.delete(`/cart/delete/${productId}`);
      return response.data.data?.cart ?? response.data.data ?? response.data;
    } catch (error: Error | any) {
      console.log(error.response?.data?.message || "failed to remove cart item");
      throw new Error(error.response?.data?.message || "failed to remove cart item");
    }
  }
};

export default cartService;
