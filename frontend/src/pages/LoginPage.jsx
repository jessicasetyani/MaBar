import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { emailLogin, emailRegister, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    // Check for auth error in URL parameters
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      // Handle authentication error - could show error message to user
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (!user.role) {
        navigate('/role-selection');
      } else if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isRegistering) {
        result = await emailRegister(data.email, data.password, data.firstName, data.lastName);
      } else {
        result = await emailLogin(data.email, data.password);
      }
      
      if (result.success) {
        const user = result.user;
        if (!user.role) {
          navigate('/role-selection');
        } else if (!user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    reset();
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
          <form onSubmit={handleSubmit(onSubmit)} className="email-form">
            {isRegistering && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name"
                    {...register('firstName', { required: 'First name is required' })}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...register('lastName', { required: 'Last name is required' })}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
                </div>
              </>
            )}
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="login-btn email-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          <button 
            type="button" 
            className="toggle-mode-btn"
            onClick={toggleMode}
          >
            {isRegistering ? 'Already have an account? Sign in' : 'New to MaBar? Create an account'}
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
