import api from "@/lib/api";

const productsService = {
  getShopProducts: async (shopId: string) => {
    try {
      const response = await api.get(`/products/${shopId}`);
      return response.data.data;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to get products");
    }
  },

  getAllProducts: async (search?: string, category?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category && category !== "الكل") params.append("category", category);
      const response = await api.get(`/products/all-products?${params.toString()}`);
      return response.data.data.products;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to get products");
    }
  },

  getPlatformStats: async () => {
    try {
      const response = await api.get("/admin/platform-stats");
      return response.data.data;
    } catch (error: Error | any) {
      return { totalProducts: 0, totalCustomers: 0, totalShops: 0, avgRating: 0 };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get("/products/categories");
      return response.data.data.categories;
    } catch (error: Error | any) {
      return [];
    }
  },


  getDealsProducts: async () => {
    try {
      const response = await api.get("/products/deals");
      return response.data.data.products;
    } catch (error: Error | any) {
      return [];
    }
  },

  getNewArrivals: async (limit: number = 10) => {
    try {
      const response = await api.get(`/products/new-arrivals?limit=${limit}`);
      return response.data.data.products;
    } catch (error: Error | any) {
      return [];
    }
  },

  addProduct: async (productData: any) => {
    try {
      const response = await api.post("/products/create-product", productData);
      return response.data.data.product;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to add product");
    }
  },

  updateProduct: async (productId: string, productData: any) => {
    try {
      const response = await api.patch(`/products/update-product/${productId}`, productData);
      return response.data.data.product;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to update product");
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      const response = await api.delete(`/products/delete-product/${productId}`);
      return response.data.message;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to delete product");
    }
  },

  getProductById: async (productId: string) => {
    try {
      const response = await api.get(`/products/product/${productId}`);
      return response.data.data.product;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to get product");
    }
  },

  addReview: async (productId: string, reviewData: any) => {
    try {
      const response = await api.post(`/products/add-review/${productId}`, reviewData);
      return response.data.data.review;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to add review");
    }
  },

  getReviews: async (productId: string) => {
    try {
      const response = await api.get(`/products/product-reviews/${productId}`);
      return response.data.data.reviews;
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || "failed to get reviews");
    }
  },
};

export default productsService;
