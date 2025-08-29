import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, getDashboardRoute } from '../constants/roles';

const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    console.log('HomePage: Auth state changed', {
      loading,
      isAuthenticated,
      user: user ? { ...user, onboardingCompleted: user.onboardingCompleted } : null,
      hasNavigated: hasNavigated.current
    });

    // Add a small delay to ensure auth state is stable
    const timer = setTimeout(() => {
      console.log('HomePage: Timer triggered', { loading, hasNavigated: hasNavigated.current });

      if (!loading && !hasNavigated.current) {
        console.log('HomePage: Attempting navigation...', { isAuthenticated, user });

        if (isAuthenticated && user) {
          // Check if user has a role assigned
          if (!user.role) {
            console.log('HomePage: User has no role, navigating to role selection');
            hasNavigated.current = true;
            navigate('/role-selection');
          } else if (!user.onboardingCompleted) {
            console.log('HomePage: Navigating to onboarding');
            hasNavigated.current = true;
            navigate('/onboarding');
          } else {
            // Navigate to role-specific dashboard
            const dashboardRoute = getDashboardRoute(user.role);
            console.log(`HomePage: Navigating to ${dashboardRoute} for role ${user.role}`);
            hasNavigated.current = true;
            navigate(dashboardRoute);
          }
        } else if (!isAuthenticated) {
          console.log('HomePage: Navigating to login');
          hasNavigated.current = true;
          console.log('HomePage: About to call navigate("/login")');
          navigate('/login');
          console.log('HomePage: navigate("/login") called');
        } else {
          console.log('HomePage: Waiting for auth state to resolve', { isAuthenticated, user });
        }
      } else {
        console.log('HomePage: Not navigating', {
          loading,
          hasNavigated: hasNavigated.current,
          reason: loading ? 'still loading' : 'already navigated'
        });
      }
    }, 100); // Small delay to ensure state stability

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, user, navigate]);

  // Fallback navigation effect (without timer)
  useEffect(() => {
    console.log('HomePage: Fallback navigation check', { loading, isAuthenticated, hasNavigated: hasNavigated.current });

    if (!loading && !hasNavigated.current) {
      if (!isAuthenticated) {
        console.log('HomePage: Fallback navigation to login');
        hasNavigated.current = true;
        navigate('/login');
      } else if (isAuthenticated && user && !user.role) {
        console.log('HomePage: Fallback navigation to role selection');
        hasNavigated.current = true;
        navigate('/role-selection');
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Show content briefly while navigation is happening
  if (hasNavigated.current) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Redirecting...</p>
      </div>
    );
  }

  const handleManualLogin = () => {
    console.log('HomePage: Manual login button clicked');
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🏓 MaBar</h1>
        <h2>Smart Padel Matchmaking</h2>
        <p>Connect with players, find venues, and elevate your game</p>

        {/* Temporary debug button */}
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={handleManualLogin}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Continue to Login (Debug)
          </button>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Debug Info: loading={loading.toString()}, isAuthenticated={isAuthenticated.toString()}, hasNavigated={hasNavigated.current.toString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
