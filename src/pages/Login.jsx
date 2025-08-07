import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import api from "../services/base";
import { routeOnboardingStep } from "../../utils/RouteOnboardingStep";
import OnboardingProgress from "../components/OnboardingProgress";

// Simple SVG icon for Google
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.853 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Only redirect if authenticated and not loading
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  // Show loading while auth is being verified
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post("/users/login", { email, password });

      // Store token regardless of user type
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        await login(res.data.token);

        // Special handling for admin
        if (res.data.isAdmin) {
          console.log("Admin login detected");
          navigate("/admin");
          return;
        }

        // Regular navigation for non-admin users
        navigate(from, { replace: true });
      }

      // Handle onboarding steps (same as before)
      if (res.data.next_action) {
        routeOnboardingStep(res.data.next_action, navigate, {
          email: res.data.email || email,
          message: res.data.message || "Please complete your account setup."
        });
        return;
      }

    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.next_action) {
        routeOnboardingStep(err.response.data.next_action, navigate, {
          email: err.response.data.email || email,
          message: err.response.data.message || "Please complete your account setup."
        });
        return;
      }
      
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
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
        {/* Pass a placeholder or logic-driven step to the progress component */}
        <OnboardingProgress currentStep="LOGIN" />

        <div className="card bg-base-100 shadow-xl border border-base-300 mt-4">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl mb-4">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Email*</span>
                </div>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              {/* Password Input */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Password*</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {/* Error Display */}
              {error && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="loading loading-spinner"></span>}
                Login
              </button>
            </form>

            <div className="divider">OR</div>

            {/* Google Login Button */}
            <button className="btn btn-outline w-full" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Sign in with Google
            </button>
            
            <div className="text-center mt-4">
              <Link to="/register" className="link link-hover text-sm">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}