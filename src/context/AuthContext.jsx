import { createContext, useState, useEffect } from "react";
import api from "../services/base"; // Corrected import path

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyExistingToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await api.get("/users/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
          setIsAuthenticated(true);
          setToken(storedToken);
        } catch (error) {
          console.error("Token validation failed on load:", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyExistingToken();
  }, []); // <-- Run only once on component mount

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("onboarding_step");
    localStorage.removeItem("onboarding_email");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};