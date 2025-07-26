import { useContext } from "react";
import api from "../services/base";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const login = async (newToken) => {
    if (!newToken) {
      throw new Error("Login function called without a token.");
    }

    try {
      // 1. Set token in localStorage
      localStorage.setItem("token", newToken);

      // 2. Fetch user data with the NEW token
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${newToken}` },
      });

      // 3. Update context state
      context.setUser(response.data);
      context.setToken(newToken);
      context.setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      // Clear all auth state on failure
      localStorage.removeItem("token");
      context.setToken(null);
      context.setUser(null);
      context.setIsAuthenticated(false);
      throw error;
    }
  };

  return {
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    login,
    logout: context.logout,
  };
};
