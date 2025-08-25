import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const OnboardingComplete = ({ onComplete, user }) => {
  const { loading } = useAuth();
  const [policiesAccepted, setPoliciesAccepted] = useState(false);

  const isVenueOwner = user?.role === 'venue_owner';

  const handleComplete = () => {
    if (isVenueOwner && !policiesAccepted) {
      return; // Don't proceed if venue owner hasn't accepted policies
    }
    onComplete();
  };

  const getWelcomeMessage = () => {
    if (user?.role === 'venue_owner') {
      return {
        title: `Welcome to MaBar, ${user.firstName}! 🏢`,
        subtitle: 'Your venue is ready to connect with players',
        features: [
          'Manage your court bookings',
          'View player reviews and ratings',
          'Track venue analytics and insights',
          'Connect with the padel community'
        ]
      };
    } else {
      return {
        title: `Welcome to MaBar, ${user.firstName}! 🏓`,
        subtitle: 'You\'re all set to start playing',
        features: [
          'Find players at your skill level',
          'Book courts at nearby venues',
          'Track your progress and stats',
          'Join tournaments and events'
        ]
      };
    }
  };

  const welcomeData = getWelcomeMessage();

  return (
    <div className="onboarding-complete">
      <div className="step-content">
        <div className="completion-animation">
          <div className="success-icon">✅</div>
        </div>

        <h2>{welcomeData.title}</h2>
        <p className="completion-subtitle">{welcomeData.subtitle}</p>

        <div className="profile-summary">
          <h3>Your Profile Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Role:</span>
              <span className="summary-value">
                {user?.role === 'venue_owner' ? 'Venue Owner' : 'Player'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Location:</span>
              <span className="summary-value">{user?.location?.city || 'Not specified'}</span>
            </div>
            {user?.role === 'player' && (
              <div className="summary-item">
                <span className="summary-label">Skill Level:</span>
                <span className="summary-value">{user?.skillLevel || 'Not assessed'}/10</span>
              </div>
            )}
            {user?.role === 'venue_owner' && (
              <div className="summary-item">
                <span className="summary-label">Venue:</span>
                <span className="summary-value">{user?.venueDetails?.venueName || 'Not specified'}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Profile Completeness:</span>
              <span className="summary-value">{user?.profileCompleteness || 0}%</span>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's next?</h3>
          <ul className="features-list">
            {welcomeData.features.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">🎯</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {isVenueOwner && (
          <div className="policies-section">
            <h3>Terms and Policies</h3>
            <div className="policy-card">
              <div className="policy-item">
                <label className="policy-label">
                  <input
                    type="checkbox"
                    checked={policiesAccepted}
                    onChange={(e) => setPoliciesAccepted(e.target.checked)}
                  />
                  <span className="policy-text">
                    I agree to the <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>,
                    and <strong>Venue Owner Guidelines</strong>. I understand that my venue will be
                    listed publicly and I am responsible for managing bookings and maintaining
                    accurate information.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="completion-tips">
          <div className="tip-card">
            <h4>💡 Pro Tip</h4>
            <p>
              {user?.role === 'venue_owner'
                ? 'Upload photos of your venue and verify your listing to attract more bookings!'
                : 'Complete your first match to start building your reputation and unlock more features!'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="step-navigation">
        <button
          className="btn btn-primary btn-large"
          onClick={handleComplete}
          disabled={loading || (isVenueOwner && !policiesAccepted)}
        >
          {loading ? 'Setting up...' : 'Enter MaBar Dashboard'}
        </button>
        {isVenueOwner && !policiesAccepted && (
          <p className="policy-warning">Please accept the terms and policies to continue</p>
        )}
      </div>
    </div>
  );
};

export default OnboardingComplete;
