import { Routes, Route } from "react-router-dom";
import Home from "./src/pages/Home";
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Dashboard from "./src/pages/Dashboard";
import CreatePage from "./src/pages/CreatePage";
import Payment from "./src/pages/Payment";
import UpgradePlan from "./src/pages/UpgradePlan";
import PublicPage from "./src/pages/PublicPage";
import OauthSuccess from "./src/pages/OauthSuccess";
import VerifyEmail from "./src/pages/VerifyEmail";
import VerifyOTP from "./src/pages/VerifyOTP";
import CompleteProfile from "./src/pages/CompleteProfile";
import EmailCallback from "./src/pages/EmailCallback";

function AppRouter({ login }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login login={login} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/upgrade" element={<UpgradePlan />} />
      <Route path="/page/:username" element={<PublicPage />} />

      {/* OAuth success route */}
      <Route path="/oauth-success" element={<OauthSuccess login={login} />} />

      {/* Email verification routes */}
      <Route path="/verify-email/:token" element={<EmailCallback />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* OTP verification route */}
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* Complete profile route */}
      <Route path="/complete-profile" element={<CompleteProfile />} />
    </Routes>
  );
}

export default AppRouter;
