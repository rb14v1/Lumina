// src/api/axios.js
import axios from "axios";

const baseURL = "http://50.17.86.95/api";

const api = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 0️⃣ Prevent retry/refresh logic for the LOGIN endpoint
    if (originalRequest.url.includes("/token/")) {
      // Attach user-friendly message
      error.userMessage =
        error.response?.data?.detail ||
        "Invalid username or password";
      return Promise.reject(error);
    }

    // 1️⃣ Custom readable error for manual login page
    if (
      originalRequest.url.includes("/auth/login") &&
      (error.response?.status === 400 || error.response?.status === 401)
    ) {
      error.userMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Invalid username or password";
      return Promise.reject(error);
    }

    // 2️⃣ Skip refresh for user info requests
    if (error.response?.status === 401 && originalRequest.url.includes("/users/me/")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return Promise.reject(error);
    }

    // 3️⃣ Token refresh logic for other endpoints
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const rs = await axios.post(`${baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = rs.data;

        localStorage.setItem("accessToken", access);
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.log("Session expired, logging out.");
        localStorage.clear();
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
