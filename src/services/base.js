import axios from "axios";

const getStoredToken = () => localStorage.getItem("token");

// Make sure your API client uses the correct production URL
const API_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', API_URL);

// Create an Axios instance with environment-aware URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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
      return Promise.reject(error);
    }

    // Handle token refresh for 401s - IMPROVED
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh-token") &&
      !originalRequest.url.includes("login") &&
      !originalRequest.url.includes("register")
    ) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh token...");
        
        const currentToken = getStoredToken();
        if (currentToken) {
          // Use axios directly to avoid interceptor loops
          const refreshResponse = await axios.post(
            `${API_URL}/users/refresh-token`,
            {},
            { 
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true
            }
          );
          
          if (refreshResponse.data?.token) {
            console.log("Got new token from refresh endpoint");
            localStorage.setItem("token", refreshResponse.data.token);
            api.defaults.headers.common["Authorization"] = `Bearer ${refreshResponse.data.token}`;
            
            // Retry the original request with new token
            originalRequest.headers["Authorization"] = `Bearer ${refreshResponse.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        
        if (!isRedirecting && window.location.pathname !== "/login") {
          isRedirecting = true;
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle general 401 errors with better condition checking
    if (error.response?.status === 401 && !isRedirecting) {
      const currentPath = window.location.pathname;
      const shouldRedirect = ![
        "/login",
        "/register",
        "/oauth-success"
      ].some(path => currentPath.startsWith(path)) && 
      !currentPath.startsWith("/verify-") && 
      !currentPath.startsWith("/admin");

      if (shouldRedirect) {
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
  
  // Also reset on popstate (browser back/forward)
  window.addEventListener("popstate", () => {
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

export default api;
