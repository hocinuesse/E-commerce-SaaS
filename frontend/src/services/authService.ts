import api from "@/lib/api";
import { User } from "@/interfaces/IUserStore";

const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login successful:", response.data.data.user);
      return response.data.data.user;
    } catch (error: Error | any) {
      console.log(
        error?.response?.data?.message || "Failed to login. Please try again.",
      );
      throw new Error(
        error?.response?.data?.message || "Failed to login. Please try again."
      );
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error: Error | any) {
      console.error(
        "Logout API Error:",
        error?.response?.data?.message ||
          "An error occurred during logout. Please try again.",
      );
      throw new Error(
        error?.response?.data?.message ||
        "An error occurred during logout. Please try again."
      );
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data.data.user;
    } catch (error: Error | any) {
      console.error(
        "Registration API Error:",
        error?.response?.data?.message ||
          "An error occurred during registration. Please try again.",
      );
      throw new Error(
        error?.response?.data?.message ||
        "An error occurred during registration. Please try again."
      );
    }
  },

  getMe: async (silent = false): Promise<User | null> => {
    try {
      const response = await api.get("/auth/me");
      return response.data.data.user;
    } catch (error: Error | any) {
      const message =
        error?.response?.data?.message ||
        "An error occurred while fetching user data. Please try again.";

      if (!silent) {
        console.error("Fetch User Data API Error:", message);
      }

      if (error?.response?.status === 401) {
        return null;
      }

      throw new Error(message);
    }
  },
};

export default authService;
