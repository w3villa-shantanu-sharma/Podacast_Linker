import { createContext, useState, useEffect } from "react";
import api from "../services/base";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Only check auth once on initial load
      if (authChecked) return;

      try {
        setLoading(true);
        const response = await api.get("/users/me");
        setUser(response.data);
        setIsAuthenticated(true);
        console.log("Authentication verified successfully");
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsAuthenticated(false);
        setUser(null);

        // Only redirect to login if it's a 401 and we're on a protected route
        if (error.response?.status === 401 && window.location.pathname.startsWith('/dashboard')) {
          // Let PrivateRoute handle the redirect
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [authChecked]);

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("onboarding_email");
      localStorage.removeItem("onboarding_step");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};