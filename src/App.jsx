import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { useEffect } from "react";
import Navbar from "./components/Navbar";

// Page Imports
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import CreatePage from "./pages/CreatePage";
import PublicPage from "./components/PublicPage";
import Payment from "./pages/Payment";
import OauthSuccess from "./pages/OauthSuccess";
import Playlists from "./pages/Playlists";
import VerifyEmail from "./pages/VerifyEmail";
import CompleteProfile from "./pages/CompleteProfile";
import ProfilePage from "./pages/ProfilePage";
import VerifyOTP from "./pages/VerifyOTP";
import NotFound from "./pages/NotFound"; // <-- Import the new 404 page
import EditProfile from "./pages/EditProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import Unauthorized from "./pages/Unauthorized"; // Create this page

// Routing
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

const App = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Change favicon based on theme
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = theme === "dark" 
        ? "/favicon-dark.ico" 
        : "/favicon-light.ico";
    }
  }, [theme]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        {/* The Login component can get the 'login' function from useAuth() itself */}
        <Route path="/login" element={<Login />} /> 
        <Route path="/oauth-success" element={<OauthSuccess />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/u/:username" element={<PublicPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* Complete Profile - Special Case: Needs token but may not be "fully authenticated" */}
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* --- Protected Routes --- */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create" element={<PrivateRoute><CreatePage /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/me" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } 
        />
        
        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* --- Fallback Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;