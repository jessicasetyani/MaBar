import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Preferences = ({ data, onNext, onPrevious, onStepData }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    notifications: {
      email: data?.notifications?.email ?? true,
      push: data?.notifications?.push ?? true,
      sms: data?.notifications?.sms ?? false
    },
    privacy: {
      showProfile: data?.privacy?.showProfile ?? true,
      showStats: data?.privacy?.showStats ?? true,
      showLocation: data?.privacy?.showLocation ?? true
    }
  });
  const [loading, setLoading] = useState(false);

  const handleNotificationChange = (type) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyChange = (type) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // Update preferences via API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/profile/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onStepData(formData);
        onNext();
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preferences">
      <div className="step-content">
        <h2>Set your preferences</h2>
        <p>Customize how you want to use MaBar</p>

        <div className="preferences-sections">
          <div className="preference-section">
            <h3>📱 Notifications</h3>
            <p>Choose how you'd like to receive updates</p>
            
            <div className="preference-options">
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Email Notifications</h4>
                  <p>Match confirmations, booking updates, and important announcements</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h4>Push Notifications</h4>
                  <p>Real-time updates on your mobile device</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h4>SMS Notifications</h4>
                  <p>Text messages for urgent updates</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="preference-section">
            <h3>🔒 Privacy</h3>
            <p>Control what information is visible to other users</p>
            
            <div className="preference-options">
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Show Profile</h4>
                  <p>Allow other users to view your profile information</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.privacy.showProfile}
                    onChange={() => handlePrivacyChange('showProfile')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {user?.role === 'player' && (
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Show Stats</h4>
                    <p>Display your game statistics and skill level</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.privacy.showStats}
                      onChange={() => handlePrivacyChange('showStats')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              )}

              <div className="preference-item">
                <div className="preference-info">
                  <h4>Show Location</h4>
                  <p>Allow others to see your city for local matches</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.privacy.showLocation}
                    onChange={() => handlePrivacyChange('showLocation')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-navigation">
        <button 
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={loading}
        >
          Previous
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Preferences;
