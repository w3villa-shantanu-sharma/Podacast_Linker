import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routeOnboardingStep } from '../../utils/RouteOnboardingStep';

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

        setStatus("Finalizing your login...");
          
        // No need to store token in localStorage - it's in cookies
        // Just call login to update auth context state
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