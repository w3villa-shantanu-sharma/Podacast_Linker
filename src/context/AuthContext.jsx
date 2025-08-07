import { createContext, useState, useEffect } from "react";
import api from "../services/base";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // This effect runs once when the component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Try to get token from localStorage first
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set token in headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Validate token with server
            const response = await api.get('/users/me');
            setUser(response.data);
            setIsAuthenticated(true);
            setIsAdmin(response.data.role === 'admin');
            console.log("User authenticated, admin status:", response.data.role === 'admin');
            return;
          } catch (error) {
            console.log("Stored token invalid, trying cookie-based auth");
            // Token in localStorage was invalid, 
            // but might still have valid cookie
          }
        }
        
        // Try cookie-based auth as fallback
        try {
          const response = await api.get('/users/me');
          if (response.data) {
            // Cookie auth worked, update localStorage too
            const token = response.headers.authorization?.split(' ')[1];
            if (token) localStorage.setItem('token', token);
            
            setUser(response.data);
            setIsAuthenticated(true);
            setIsAdmin(response.data.role === 'admin');
            console.log("User authenticated, admin status:", response.data.role === 'admin');
          }
        } catch (err) {
          // Neither localStorage nor cookie auth worked
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
        isAdmin,
        setIsAdmin,
        loading,
        setLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};