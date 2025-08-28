import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RoleSelection = ({ data, onNext, onStepData, isFirstStep }) => {
  const { setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(data || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setError('');

    // Immediately save the role to the backend
    setLoading(true);
    try {
      const result = await setUserRole(role === 'player' ? 'Player' : 'VenueOwner');
      
      if (result.success) {
        onStepData(role);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      setError('Failed to save role selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedRole && !loading) {
      onNext();
    }
  };

  return (
    <div className="role-selection">
      <div className="step-content">
        <h2>What brings you to MaBar?</h2>
        <p>Choose your role to customize your experience</p>

        <div className="role-options">
          <div
            className={`role-card ${selectedRole === 'player' ? 'selected' : ''} ${loading ? 'loading' : ''}`}
            onClick={() => !loading && handleRoleSelect('player')}
          >
            <div className="role-icon">🏓</div>
            <h3>Player</h3>
            <p>Find opponents, book courts, and improve your game</p>
            <ul className="role-features">
              <li>Match with players of similar skill level</li>
              <li>Book courts at nearby venues</li>
              <li>Track your progress and stats</li>
              <li>Join tournaments and events</li>
            </ul>
            {loading && selectedRole === 'player' && (
              <div className="loading-overlay">Saving...</div>
            )}
          </div>

          <div
            className={`role-card ${selectedRole === 'venue_owner' ? 'selected' : ''} ${loading ? 'loading' : ''}`}
            onClick={() => !loading && handleRoleSelect('venue_owner')}
          >
            <div className="role-icon">🏢</div>
            <h3>Venue Owner</h3>
            <p>Manage your venue and connect with players</p>
            <ul className="role-features">
              <li>List your courts and facilities</li>
              <li>Manage bookings and schedules</li>
              <li>View analytics and insights</li>
              <li>Connect with the padel community</li>
            </ul>
            {loading && selectedRole === 'venue_owner' && (
              <div className="loading-overlay">Saving...</div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message role-error">{error}</div>
        )}
      </div>

      <div className="step-navigation">
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedRole || loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
