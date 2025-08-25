import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Check if user needs onboarding
        if (!user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/login');
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🏓 MaBar</h1>
        <h2>Smart Padel Matchmaking</h2>
        <p>Connect with players, find venues, and elevate your game</p>
      </div>
    </div>
  );
};

export default HomePage;
