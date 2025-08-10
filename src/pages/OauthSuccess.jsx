import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routeOnboardingStep } from '../../utils/RouteOnboardingStep';
import api from '../services/base';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const nextAction = params.get('next_action');
        const email = params.get('email');
        const token = params.get('token');

        setStatus("Finalizing your login...");

        if (!token) {
          console.error("No token received from OAuth callback");
          setStatus("Authentication failed - no token received");
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log("Setting up authentication with token from OAuth");
        
        // Store token and set up authentication
        localStorage.setItem("token", token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to set cookie as well (for same-domain requests)
        try {
          await api.post('/users/set-auth-cookie', { token });
        } catch (cookieError) {
          console.warn("Failed to set auth cookie (this is expected for cross-domain):", cookieError);
        }

        // Verify the token works by fetching user data
        try {
          const userResponse = await api.get('/users/me');
          console.log("User authentication verified:", userResponse.data);
          
          // Update auth context with actual user data from the verified API call
          await login(token);
          
        } catch (authError) {
          console.error("Failed to verify authentication:", authError);
          setStatus("Authentication verification failed");
          localStorage.removeItem("token");
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Handle next action for incomplete profiles
        if (nextAction && nextAction !== 'null') {
          console.log("Routing to onboarding step:", nextAction);
          routeOnboardingStep(nextAction, navigate, { email });
        } else {
          // Profile is complete, check if user is admin
          const userResponse = await api.get('/users/me');
          if (userResponse.data.role === 'admin') {
            console.log("Admin user detected, redirecting to admin dashboard");
            navigate('/admin', { replace: true });
          } else {
            console.log("Regular user, redirecting to dashboard");
            navigate('/dashboard', { replace: true });
          }
        }
        
      } catch (error) {
        console.error('OAuth success error:', error);
        setStatus("An error occurred during authentication");
        setTimeout(() => {
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
        }, 2000);
      }
    };

    handleOAuthSuccess();
  }, [login, navigate]);

  return (
    <div className="min-h-screen hero bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold">{status}</h1>
            <div className="loading loading-spinner loading-lg"></div>
            <p className="text-sm opacity-70">Please wait while we complete your sign-in...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;