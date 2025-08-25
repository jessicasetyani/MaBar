import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for auth success/error in URL parameters
    const authStatus = searchParams.get('auth');
    const error = searchParams.get('error');

    if (authStatus === 'success') {
      // Authentication successful, redirect based on onboarding status
      if (user && !user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } else if (error) {
      console.error('Authentication error:', error);
      // Handle authentication error
    }
  }, [searchParams, navigate, user]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      if (user && !user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = () => {
    login('google');
  };

  const handleFacebookLogin = () => {
    login('facebook');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🏓 MaBar</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your padel journey</p>
        </div>

        <div className="login-form">
          <button 
            className="login-btn google-btn"
            onClick={handleGoogleLogin}
          >
            <span className="btn-icon">🔐</span>
            Continue with Google
          </button>

          <button 
            className="login-btn facebook-btn"
            onClick={handleFacebookLogin}
          >
            <span className="btn-icon">🔐</span>
            Continue with Facebook
          </button>
        </div>

        <div className="login-footer">
          <p>New to MaBar? Create an account by signing in above.</p>
          <p className="terms">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
