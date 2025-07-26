import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePage from "./pages/CreatePage";
import PublicPage from "./pages/PublicPage";
import Payment from "./pages/Payment";
import UpgradePlan from "./pages/UpgradePlan";
import OauthSuccess from "./pages/OauthSuccess"; // ✅ Import here
import VerifyEmail from "./src/pages/VerifyEmail";

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

      {/* ✅ Oauth success route */}
      <Route path="/oauth-success" element={<OauthSuccess login={login} />} />

      {/* Email verification routes */}
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
}

export default AppRouter;
