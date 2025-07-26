import { useAuth } from "./hooks/useAuth"; //  import this hook
import Navbar from "./components/Navbar";

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
import EmailCallback from "./pages/EmailCallback";
import VerifyOTP from "./pages/VerifyOTP"; // Add this import

import PrivateRoute from "./routes/PrivateRoute";
import { Routes, Route } from "react-router-dom";

const App = () => {
  const { user, login, logout } = useAuth(); //  get login, logout, user

  return (
    <>
      <Navbar user={user} logout={logout} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login login={login} />} />{" "}
        {/* pass login */}
        <Route
          path="/oauth-success"
          element={<OauthSuccess login={login} />}
        />{" "}
        <Route path="/playlists" element={<Playlists />} />
        {/* pass login */}
        <Route path="/u/:username" element={<PublicPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />{" "}
        {/* Add this route */}
        <Route path="/email-callback" element={<EmailCallback />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />{" "}
        {/* Add this route */}
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          }
        />
        <Route
          path="/complete-profile"
          element={
            <PrivateRoute>
              <CompleteProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/me"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        {/* Fallback route */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem" }}>
              <h1>404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
