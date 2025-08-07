import { useContext } from "react";
import api from "../services/base";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Modify the login function
  const login = async (token) => {
    try {
      console.log("Login function called with token:", token ? "exists" : "missing");
      
      // Set authorization header and localStorage
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
      }
      
      // Get current user data
      const response = await api.get('/users/me');
      console.log("User data retrieved:", response.data);
      
      // Update auth context with user data
      context.setUser(response.data);
      context.setIsAuthenticated(true);
      
      // Explicitly check for admin role
      const isAdmin = response.data.role === 'admin';
      console.log("Setting isAdmin state to:", isAdmin);
      context.setIsAdmin(isAdmin);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      context.setUser(null);
      context.setIsAuthenticated(false);
      context.setIsAdmin(false);
      localStorage.removeItem('token');
      api.defaults.headers.common['Authorization'] = '';
      return false;
    }
  };

  const logout = async () => {
    try {
      // Server-side logout (revokes token)
      await api.post("/users/logout");
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      // Always clear local storage regardless of server response
      localStorage.removeItem("token");
      localStorage.removeItem("onboarding_email");
      localStorage.removeItem("onboarding_step");
      localStorage.removeItem("otp_sent_ts");
      localStorage.removeItem("resend_email_ts");
      
      // Clear auth context
      context.setUser(null);
      context.setIsAuthenticated(false);
      context.setIsAdmin(false);
      
      // Clear request header
      api.defaults.headers.common['Authorization'] = '';
    }
  };

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isAdmin: context.isAdmin, // Add this line
    loading: context.loading,
    login,
    logout,
  };
};
