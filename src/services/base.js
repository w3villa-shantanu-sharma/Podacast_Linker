import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (!originalRequest._retry && 
        error.response?.status === 401 && 
        error.response?.data?.code === "TOKEN_EXPIRED") {
      
      originalRequest._retry = true;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const refreshResponse = await axios.post("/api/users/refresh-token", {}, {
          withCredentials: true
        });
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (!isRedirecting && window.location.pathname !== '/login') {
          isRedirecting = true;
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle general 401 errors (invalid token, no token, etc.)
    if (error.response?.status === 401 && !isRedirecting) {
      // Only redirect if we're not already on login page
      if (window.location.pathname !== '/login' && 
          !window.location.pathname.startsWith('/register') &&
          !window.location.pathname.startsWith('/verify-')) {
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
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    isRedirecting = false;
  });
}

export default api;
