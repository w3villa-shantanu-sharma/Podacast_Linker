import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";
import { routeOnboardingStep } from "../../utils/RouteOnboardingStep";

export default function EmailCallback() {
  const navigate = useNavigate();
  // We can use the loading state to show different messages
  const [status, setStatus] = useState("Verifying your email...");

  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/users/verify-email?token=${token}`);
        const { next_action, email, message } = res.data;
        
        setStatus("Verification successful! Redirecting...");

        // Pass the success message to the next route
        const state = { 
          message: message || "Email verified successfully!",
          email: email // Pass email if needed by the next step
        };
        
        // Use a short delay so the user can see the success message
        setTimeout(() => {
          routeOnboardingStep(next_action, navigate, state);
        }, 1500);

      } catch (err) {
        const errorMessage = err.response?.data?.message || "Invalid or expired link. Please try again.";
        setStatus("Verification failed.");
        
        // Redirect to login with an error message
        setTimeout(() => {
          navigate("/login", { state: { error: errorMessage } });
        }, 2000);
      }
    };

    if (token) {
      verifyToken();
    } else {
      // Handle the case where no token is present
      setStatus("Verification token not found.");
      setTimeout(() => {
        navigate("/login", { state: { error: "No verification token was provided." } });
      }, 2000);
    }
  }, [navigate, token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <OnboardingProgress currentStep="EMAIL_VERIFICATION" />
        
        <div className="card bg-base-100 shadow-xl border border-base-300 mt-4">
            <div className="card-body items-center text-center">
                <h2 className="card-title text-2xl mb-4">
                    Email Verification
                </h2>
                
                <p className="mb-6">{status}</p>

                {/* DaisyUI progress bar */}
                <progress className="progress progress-primary w-56"></progress>
            </div>
        </div>
      </div>
    </div>
  );
}