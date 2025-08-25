import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect to onboarding if not completed
    if (user && !user.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
  }, [user, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome back, {user.firstName}! 🏓</h1>
          <p>Role: {user.role === 'venue_owner' ? 'Venue Owner' : 'Player'}</p>
          <p>Profile Completeness: {user.profileCompleteness || 0}%</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        {user.role === 'player' ? (
          <PlayerDashboard user={user} />
        ) : (
          <VenueOwnerDashboard user={user} />
        )}
      </div>
    </div>
  );
};

const PlayerDashboard = ({ user }) => {
  return (
    <div className="player-dashboard">
      <div className="dashboard-section">
        <h2>Your Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Skill Level</h3>
            <p className="stat-value">{user.skillLevel || 'Not set'}/10</p>
          </div>
          <div className="stat-card">
            <h3>Games Played</h3>
            <p className="stat-value">{user.stats?.gamesPlayed || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Win Rate</h3>
            <p className="stat-value">
              {user.stats?.gamesPlayed > 0 
                ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100)
                : 0}%
            </p>
          </div>
          <div className="stat-card">
            <h3>Average Rating</h3>
            <p className="stat-value">{user.stats?.averageRating?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary">Find Players</button>
          <button className="action-btn secondary">Book Venue</button>
          <button className="action-btn secondary">View Profile</button>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <p>No recent activity to show.</p>
      </div>
    </div>
  );
};

const VenueOwnerDashboard = ({ user }) => {
  return (
    <div className="venue-owner-dashboard">
      <div className="dashboard-section">
        <h2>Venue Information</h2>
        <div className="venue-info">
          <h3>{user.venueDetails?.venueName || 'Venue Name Not Set'}</h3>
          <p>{user.venueDetails?.venueAddress || 'Address not provided'}</p>
          <p>Price: ${user.venueDetails?.pricePerHour || 0}/hour</p>
          <p>Status: {user.venueDetails?.isVerified ? 'Verified ✅' : 'Pending Verification ⏳'}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary">Manage Bookings</button>
          <button className="action-btn secondary">Update Venue Info</button>
          <button className="action-btn secondary">View Analytics</button>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Bookings</h2>
        <p>No recent bookings to show.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
