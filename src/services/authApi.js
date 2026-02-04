import axios from "axios";
import { isTokenExpired, getRefreshToken } from "../utils/authStorage";

const API_BASE_URL = "http://crm-backend-prod.eba-u6tu4mfm.us-west-2.elasticbeanstalk.com/api";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add token to requests and refresh if needed
authApi.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("access_token");
    
    // Check if token is expired or about to expire
    if (token && isTokenExpired(token)) {
      const refreshToken = getRefreshToken();
      
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);
          token = newAccessToken;
          
          processQueue(null, newAccessToken);
        } catch (error) {
          processQueue(error, null);
          
          // Clear auth data on refresh failure
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("crm_user");
          
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          })
          .catch((err) => Promise.reject(err));
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          // Use a plain axios instance to avoid interceptor loops
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const newAccessToken = response.data.access;
          
          // Update stored token
          localStorage.setItem("access_token", newAccessToken);
          
          // Update default headers
          authApi.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Update the failed request's header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return authApi(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear all auth data and redirect to login
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("crm_user");
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, clear auth and redirect
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("crm_user");
        
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApiService = {
  signup: ({ email, password, fullName }) =>
    authApi.post("/signup/", { email, password, full_name: fullName }),

  login: (email, password) =>
    authApi.post("/login/", { email, password }),

  googleLogin: (idToken) =>
    authApi.post("/auth/google/", { id_token: idToken }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("crm_user");
  },
};

export default authApi;
