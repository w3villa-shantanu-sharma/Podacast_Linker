import { useContext } from "react";
import api from "../services/base";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const login = async (tokenFromResponse = null) => {
    try {
      // If we have a token from login response, we still need to fetch user data
      const response = await api.get("/users/me");
      context.setUser(response.data);
      context.setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error("Login verification failed:", error);
      context.setIsAuthenticated(false);
      context.setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      context.setUser(null);
      context.setIsAuthenticated(false);
      
      // Clear localStorage items
      localStorage.removeItem("onboarding_email");
      localStorage.removeItem("onboarding_step");
      localStorage.removeItem("otp_sent_ts");
      localStorage.removeItem("resend_email_ts");
    }
  };

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    login,
    logout,
  };
};
