import axios from "axios";

const getStoredToken = () => localStorage.getItem("token");

// Make sure your API client uses the correct production URL
const API_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', API_URL); // Debug log to verify URL

// Create an Axios instance with environment-aware URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/auth
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent redirect loops for admin routes
    if (
      error.response?.status === 401 &&
      originalRequest.url.includes("/admin") &&
      !originalRequest._retry
    ) {
      console.warn("Admin route authorization failed:", originalRequest.url);
      // For admin routes, don't redirect automatically
      return Promise.reject(error);
    }

    // Handle token refresh for 401s
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh token...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // First, try to get token from cookie if present
        const refreshResponse = await api.post(
          "/users/refresh-token",
          {},
          { withCredentials: true }
        );
        
        // If we get a new token in the response, use it
        if (refreshResponse.data?.token) {
          console.log("Got new token from refresh endpoint");
          localStorage.setItem("token", refreshResponse.data.token);
          api.defaults.headers.common["Authorization"] = `Bearer ${refreshResponse.data.token}`;
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear token from localStorage since it's invalid
        localStorage.removeItem("token");
        if (!isRedirecting && window.location.pathname !== "/login") {
          isRedirecting = true;
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle general 401 errors with more care to prevent loops
    if (error.response?.status === 401 && !isRedirecting) {
      // Only redirect if we're not already on login page and not an admin route
      if (
        window.location.pathname !== "/login" &&
        !window.location.pathname.startsWith("/register") &&
        !window.location.pathname.startsWith("/verify-") &&
        !window.location.pathname.startsWith("/admin") // Add this check
      ) {
        isRedirecting = true;
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

// Reset redirect flag when navigating to login
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isRedirecting = false;
  });
}

// Add request interceptor to include auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle auth errors (optional)
      console.log("Unauthorized request - you may need to log in again");
    }
    return Promise.reject(error);
  }
);

// In your OAuth login functions, use the environment variable
const handleGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/users/auth/google`;
};

export default api;
