
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";
import { routeOnboardingStep } from "../../utils/RouteOnboardingStep";

const RESEND_WAIT_SECONDS = 60;

// --- Helper Icon Components ---
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || localStorage.getItem("onboarding_email") || "";
  const pathSegments = location.pathname.split("/");
  const token = pathSegments.length > 2 && pathSegments[pathSegments.length-1] !== "verify-email" ? pathSegments[pathSegments.length - 1] : null;
  const hasToken = !!token;

  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [autoVerified, setAutoVerified] = useState(false);

  // Auto-verify if token exists in URL
  useEffect(() => {
    const handleAutoVerify = async () => {
      try {
        setVerificationStatus("verifying");
        setStatusMessage("Please wait while we verify your email address...");
        
        const res = await api.get(`/users/verify-email/${token}`);
        
        setVerificationStatus("success");
        setStatusMessage(res.data.message || "Email verified successfully! Redirecting...");
        
        setTimeout(() => {
          routeOnboardingStep(res.data.next_action, navigate, {
            email: res.data.email || email,
            message: "Email verified successfully!"
          });
        }, 2000);

      } catch (err) {
        setVerificationStatus("error");
        setStatusMessage(err.response?.data?.message || "Verification failed. The link may be invalid or expired.");
      }
    };

    if (hasToken && !autoVerified) {
      setAutoVerified(true);
      handleAutoVerify();
    } else if (!hasToken) {
      const lastSent = parseInt(localStorage.getItem("resend_email_ts") || "0");
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (elapsed < RESEND_WAIT_SECONDS) {
        setCooldown(RESEND_WAIT_SECONDS - elapsed);
      }
    }
  }, [hasToken, autoVerified, token, email, navigate]);

  // Redirect if no email is found
  useEffect(() => {
    if (!email && !hasToken) {
      navigate("/register");
    }
  }, [email, hasToken, navigate]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Manual resend function
  const handleResend = async () => {
    if (!email) {
        setStatusMessage("Email address not found. Please register again.");
        setVerificationStatus('error');
        return;
    }
    setLoading(true);
    setVerificationStatus(null);
    setStatusMessage('');

    try {
      await api.post("/users/resend-verification", { email });
      setStatusMessage(`A new verification email was sent to ${email}. Please check your inbox.`);
      setVerificationStatus('success');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || "Failed to resend. Please try again later.");
      setVerificationStatus('error');
    } finally {
      setLoading(false);
      localStorage.setItem("resend_email_ts", Date.now().toString());
      setCooldown(RESEND_WAIT_SECONDS);
    }
  };

  const progressValue = ((RESEND_WAIT_SECONDS - cooldown) / RESEND_WAIT_SECONDS) * 100;

  // Renders the main content based on whether a token is in the URL
  const renderContent = () => {
    if (hasToken) {
      // --- UI for AUTO-VERIFICATION process ---
      return (
        <>
          <h2 className="card-title justify-center text-2xl">Verifying Email</h2>
          <p className="text-center text-base-content/70 mt-2 mb-6">{statusMessage}</p>
          {verificationStatus === 'verifying' && <progress className="progress progress-primary w-full"></progress>}
          {verificationStatus === 'success' && <progress className="progress progress-success w-full"></progress>}
          {verificationStatus === 'error' && (
             <div className="card-actions justify-center mt-4">
               <Link to="/login" className="btn btn-outline">Back to Login</Link>
             </div>
          )}
        </>
      );
    }

    // --- UI for MANUAL RESEND ---
    return (
      <>
        <h2 className="card-title justify-center text-2xl">Check Your Email</h2>
        <p className="text-center text-base-content/70 mt-2 mb-6">
          We've sent a verification link to <br/>
          <span className="font-bold text-primary">{email}</span>
        </p>
        
        {statusMessage && (
            <div role="alert" className={`alert ${verificationStatus === 'success' ? 'alert-success' : 'alert-error'} text-sm`}>
                {verificationStatus === 'success' ? <IconCheck/> : <IconX/>}
                <span>{statusMessage}</span>
            </div>
        )}

        <div role="alert" className="alert mt-4">
            <IconInfo />
            <span>Click the link in the email to continue. If you don't see it, check your spam folder.</span>
        </div>

        <div className="divider my-6">Need help?</div>
        
        <div className="w-full space-y-2">
            <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="btn btn-outline w-full"
            >
                {loading && <span className="loading loading-spinner"></span>}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
            </button>
            {cooldown > 0 && (
                <progress className="progress progress-primary w-full" value={progressValue} max="100"></progress>
            )}
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <OnboardingProgress currentStep="EMAIL_VERIFICATION" />
        
        <div className="card bg-base-100 shadow-xl border border-base-300 mt-4">
          <div className="card-body items-center">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}