import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const isRefreshReq = originalRequest.url?.includes("/auth/refresh-token");
    const isLoginReq = originalRequest.url?.includes("/auth/login");
    const isMeReq = originalRequest.url?.includes("/auth/me");

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshReq &&
      !isLoginReq
    ) {
      originalRequest._retry = true;

      const method = (originalRequest.method || "get").toString().toLowerCase();
      const isGet = method === "get";

      try {
        await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        return api(originalRequest);
      } catch (refreshError) {
        if (!isGet && !isMeReq) {
          console.error("Session expired while refreshing token", refreshError);
        }

        if (typeof window !== "undefined" && !isGet) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
