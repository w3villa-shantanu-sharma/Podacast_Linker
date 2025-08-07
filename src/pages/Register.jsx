import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/base';
import OnboardingProgress from "../components/OnboardingProgress";

// Helper: Password strength logic (no changes needed)
function getStrength(password) {
  if (!password) return 0;
  let multiplier = password.length > 5 ? 0 : 1;
  if (/[A-Z]/.test(password)) multiplier += 1;
  if (/[0-9]/.test(password)) multiplier += 1;
  if (/[$&+,:;=?@#|'<>.^*()%!-~]/.test(password)) multiplier += 1;
  return Math.min((multiplier / 4) * 100, 100);
}

// Simple SVG icon for Google
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.853 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = getStrength(password);
  const strengthColor = passwordStrength > 80 ? 'progress-success' : passwordStrength > 50 ? 'progress-warning' : 'progress-error';
  const strengthText = passwordStrength > 80 ? 'Strong' : passwordStrength > 50 ? 'Moderate' : 'Weak';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post("/users/register", { name, email, password });
      
      // Store email for the verification flow
      localStorage.setItem("onboarding_email", email);
      
      // Redirect to the correct email verification page
      navigate("/verify-email", { 
        state: { 
          email: email,
          message: "Registration successful! Please check your email for a verification link." 
        }
      });
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong during registration.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/auth/google`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <OnboardingProgress currentStep="EMAIL_VERIFICATION" />
        
        <div className="card bg-base-100 shadow-xl border border-base-300 mt-4">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl mb-4">Create Your Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <label className="form-control w-full">
                <div className="label"><span className="label-text font-semibold">Name*</span></div>
                <input type="text" placeholder="Enter your full name" className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>

              {/* Email Input */}
              <label className="form-control w-full">
                <div className="label"><span className="label-text font-semibold">Email*</span></div>
                <input type="email" placeholder="your.email@example.com" className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>

              {/* Password Input */}
              <label className="form-control w-full">
                <div className="label"><span className="label-text font-semibold">Password*</span></div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Enter a secure password" className="input input-bordered w-full pr-16" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="btn btn-ghost btn-sm absolute top-1/2 right-1 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {/* Password Strength Indicator */}
              {password && (
                <div>
                  <progress className={`progress ${strengthColor} w-full`} value={passwordStrength} max="100"></progress>
                  <div className="label">
                    <span className="label-text-alt">Password strength: {strengthText}</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>
              )}

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="loading loading-spinner"></span>}
                Register
              </button>
            </form>

            <div className="divider">OR</div>

            {/* Google Login Button */}
            <button className="btn btn-outline w-full" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Sign up with Google
            </button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="link link-hover text-sm">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}