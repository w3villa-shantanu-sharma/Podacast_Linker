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
        const token = params.get('token'); // Get token from URL

        setStatus("Finalizing your login...");

        // If we have a token from the URL, store it and set up auth
        if (token) {
          console.log("Setting up authentication with token from OAuth");
          localStorage.setItem("token", token);
          
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Also try to set it as a cookie via API call
          try {
            await api.post('/users/set-auth-cookie', { token });
          } catch (cookieError) {
            console.warn("Failed to set auth cookie:", cookieError);
          }
        }

        // Update auth context state
        await login();

        // Handle next action for incomplete profiles
        if (nextAction && nextAction !== 'null') {
          routeOnboardingStep(nextAction, navigate, { email });
        } else {
          // Profile is complete, go to dashboard
          navigate('/dashboard', { replace: true });
        }
        
      } catch (error) {
        console.error('OAuth success error:', error);
        setStatus("An error occurred. Redirecting...");
        navigate('/login', { state: { error: 'An unexpected error occurred during login.' } });
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;