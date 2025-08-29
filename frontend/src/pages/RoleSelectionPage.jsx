import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../constants/roles';

const RoleSelectionPage = () => {
  const { user, setUserRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && user.role) {
      // User already has a role, redirect to homepage which will handle role-based routing
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setError('');
    setLoading(true);

    try {
      const result = await setUserRole(role);
      
      if (result.success) {
        navigate('/onboarding');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to save role selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🏓 MaBar</h1>
          <h2>Choose Your Role</h2>
          <p>What brings you to MaBar?</p>
        </div>

        <div className="role-options">
          <div
            className={`role-card ${selectedRole === USER_ROLES.PLAYER ? 'selected' : ''} ${loading ? 'loading' : ''}`}
            onClick={() => !loading && handleRoleSelect(USER_ROLES.PLAYER)}
          >
            <div className="role-icon">🏓</div>
            <h3>Player</h3>
            <p>Find opponents and book courts</p>
            <ul className="role-features">
              <li>Match with similar skill players</li>
              <li>Book courts at venues</li>
              <li>Track your progress</li>
            </ul>
            {loading && selectedRole === USER_ROLES.PLAYER && (
              <div className="loading-overlay">Saving...</div>
            )}
          </div>

          <div
            className={`role-card ${selectedRole === USER_ROLES.VENUE_OWNER ? 'selected' : ''} ${loading ? 'loading' : ''}`}
            onClick={() => !loading && handleRoleSelect(USER_ROLES.VENUE_OWNER)}
          >
            <div className="role-icon">🏢</div>
            <h3>Venue Owner</h3>
            <p>Manage your venue</p>
            <ul className="role-features">
              <li>List your courts</li>
              <li>Manage bookings</li>
              <li>View analytics</li>
            </ul>
            {loading && selectedRole === USER_ROLES.VENUE_OWNER && (
              <div className="loading-overlay">Saving...</div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionPage;