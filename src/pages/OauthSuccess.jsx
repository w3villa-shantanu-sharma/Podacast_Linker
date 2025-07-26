// oauth-success.jsx or similar
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routeOnboardingStep } from '../../utils/RouteOnboardingStep';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const nextAction = params.get('next_action');
        const email = params.get('email');

        if (token) {
          // Store token and update auth state
          localStorage.setItem("token", token);
          await login(token); // This will fetch user data

          // Handle next action for incomplete profiles
          if (nextAction && nextAction !== 'null') {
            localStorage.setItem("onboarding_step", nextAction);
            if (email) localStorage.setItem("onboarding_email", email);
            routeOnboardingStep(nextAction, navigate, email);
          } else {
            // Profile is complete, go to dashboard
            navigate('/dashboard');
          }
        } else {
          // No token, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth success error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthSuccess();
  }, [login, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Redirecting...
      </div>
    );
  }

  return null;
};

export default OAuthSuccess;
