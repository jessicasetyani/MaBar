import { useState } from 'react';

const RoleSelection = ({ data, onNext, onStepData, isFirstStep }) => {
  const [selectedRole, setSelectedRole] = useState(data || '');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    onStepData(role);
  };

  const handleNext = () => {
    if (selectedRole) {
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
            className={`role-card ${selectedRole === 'player' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('player')}
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
          </div>

          <div 
            className={`role-card ${selectedRole === 'venue_owner' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('venue_owner')}
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
          </div>
        </div>
      </div>

      <div className="step-navigation">
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
