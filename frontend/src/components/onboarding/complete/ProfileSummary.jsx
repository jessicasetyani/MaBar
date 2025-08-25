import './ProfileSummary.css';

/**
 * ProfileSummary Component
 * Displays a summary of user profile information in a grid layout
 */
const ProfileSummary = ({ user, customItems = [] }) => {
  const getDefaultSummaryItems = () => {
    const items = [
      {
        label: 'Role',
        value: user?.role === 'venue_owner' ? 'Venue Owner' : 'Player',
        icon: user?.role === 'venue_owner' ? '🏢' : '🏓'
      },
      {
        label: 'Location',
        value: user?.location?.city || 'Not specified',
        icon: '📍'
      }
    ];

    // Add role-specific items
    if (user?.role === 'player') {
      items.push({
        label: 'Skill Level',
        value: `${user?.skillLevel || 'Not assessed'}/10`,
        icon: '⭐'
      });
    } else if (user?.role === 'venue_owner') {
      items.push({
        label: 'Venue',
        value: user?.venueDetails?.venueName || 'Not specified',
        icon: '🏟️'
      });
    }

    items.push({
      label: 'Profile Completeness',
      value: `${user?.profileCompleteness || 0}%`,
      icon: '📊'
    });

    return items;
  };

  const summaryItems = customItems.length > 0 ? customItems : getDefaultSummaryItems();

  return (
    <div className="profile-summary">
      <h3 className="summary-title">Your Profile Summary</h3>
      <div className="summary-grid">
        {summaryItems.map((item, index) => (
          <div key={index} className="summary-item">
            {item.icon && <span className="summary-icon">{item.icon}</span>}
            <div className="summary-content">
              <span className="summary-label">{item.label}:</span>
              <span className="summary-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSummary;
