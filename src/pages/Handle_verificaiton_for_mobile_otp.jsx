import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/base";
import { routeOnboardingStep } from "../utils/routeOnboardingStep";

const OTP_COOLDOWN_SECONDS = 60;

export default function OtpVerification({ email, onVerified }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  // Restore cooldown from localStorage on component mount
  useEffect(() => {
    const lastSent = parseInt(localStorage.getItem("otp_sent_ts") || "0");
    const elapsed = Math.floor((Date.now() - lastSent) / 1000);
    if (elapsed < OTP_COOLDOWN_SECONDS) {
      setCooldown(OTP_COOLDOWN_SECONDS - elapsed);
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle OTP verification
  const handleVerify = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const res = await api.post("/users/verify-otp", { email, otp });
      
      // Notify parent component or navigate
      if (onVerified) {
        onVerified();
      } else {
        routeOnboardingStep(res.data.next_action, navigate, { 
          email, 
          message: "Mobile number verified successfully!" 
        });
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid or incorrect OTP.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    setError(''); // Clear previous errors
    try {
      await api.post("/users/send-otp", { email });
      setOtp(""); // Clear OTP input
      localStorage.setItem("otp_sent_ts", Date.now().toString());
      setCooldown(OTP_COOLDOWN_SECONDS);
      // Optional: show a temporary success message for resend
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to resend OTP. Please try again later.";
      setError(errorMessage);
    }
  };

  // Calculate progress for the cooldown bar
  const progress = ((OTP_COOLDOWN_SECONDS - cooldown) / OTP_COOLDOWN_SECONDS) * 100;

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 w-full max-w-sm mx-auto">
      <div className="card-body">
        <h2 className="card-title justify-center text-2xl">Verify Mobile OTP</h2>
        <p className="text-center text-sm text-base-content/70 mb-4">
          An OTP has been sent to your mobile number associated with {email}.
        </p>
        
        <div className="form-control w-full space-y-4">
          <label className="form-control w-full">
              <div className="label">
                  <span className="label-text font-semibold">Enter OTP</span>
              </div>
              <input
                  type="text"
                  placeholder="6-digit code"
                  className="input input-bordered w-full text-center tracking-widest text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
              />
          </label>
          
          {error && (
            <div role="alert" className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            onClick={handleVerify}
            disabled={loading || !otp || otp.length < 4}
          >
            {loading && <span className="loading loading-spinner"></span>}
            Verify
          </button>
          
          <div className="divider text-xs">OR</div>

          <div className="text-center">
            <button
              className="btn btn-link no-underline"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
          
          {cooldown > 0 && (
              <progress 
                className="progress progress-primary w-full" 
                value={progress} 
                max="100"
              ></progress>
          )}
        </div>
      </div>
    </div>
  );
}