import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const BusinessPreferences = ({ data, onNext, onPrevious, onStepData }) => {
  const { updatePreferences } = useAuth();
  const [formData, setFormData] = useState({
    // Notification Preferences
    notifications: {
      bookingRequests: data?.notifications?.bookingRequests ?? true,
      bookingConfirmations: data?.notifications?.bookingConfirmations ?? true,
      cancellations: data?.notifications?.cancellations ?? true,
      payments: data?.notifications?.payments ?? true,
      reviews: data?.notifications?.reviews ?? true,
      promotions: data?.notifications?.promotions ?? false,
      email: data?.notifications?.email ?? true,
      sms: data?.notifications?.sms ?? false,
      push: data?.notifications?.push ?? true
    },
    
    // Business Settings
    business: {
      autoAcceptBookings: data?.business?.autoAcceptBookings ?? false,
      requireAdvanceBooking: data?.business?.requireAdvanceBooking ?? true,
      advanceBookingHours: data?.business?.advanceBookingHours ?? 2,
      maxBookingDays: data?.business?.maxBookingDays ?? 30,
      allowCancellations: data?.business?.allowCancellations ?? true,
      cancellationDeadlineHours: data?.business?.cancellationDeadlineHours ?? 24,
      requireDeposit: data?.business?.requireDeposit ?? false,
      depositPercentage: data?.business?.depositPercentage ?? 50
    },
    
    // Privacy Settings
    privacy: {
      showContactInfo: data?.privacy?.showContactInfo ?? true,
      showBusinessHours: data?.privacy?.showBusinessHours ?? true,
      showPricing: data?.privacy?.showPricing ?? true,
      allowReviews: data?.privacy?.allowReviews ?? true,
      showInSearch: data?.privacy?.showInSearch ?? true
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleNotificationChange = (key) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleBusinessChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      business: {
        ...prev.business,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await updatePreferences(formData);
      onStepData(formData);
      onNext();
    } catch (error) {
      console.error('Failed to update business preferences:', error);
      setErrors({ submit: 'Failed to save preferences. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-preferences">
      <div className="step-content">
        <h2>Business Preferences</h2>
        <p>Configure your booking settings and notification preferences</p>

        <form className="preferences-form">
          {/* Booking Management */}
          <div className="form-section">
            <h3 className="form-section-title">Booking Management</h3>
            
            <div className="preference-group">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.business.autoAcceptBookings}
                    onChange={(e) => handleBusinessChange('autoAcceptBookings', e.target.checked)}
                  />
                  <span className="preference-text">
                    <strong>Auto-accept bookings</strong>
                    <small>Automatically approve booking requests without manual review</small>
                  </span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.business.requireAdvanceBooking}
                    onChange={(e) => handleBusinessChange('requireAdvanceBooking', e.target.checked)}
                  />
                  <span className="preference-text">
                    <strong>Require advance booking</strong>
                    <small>Players must book courts in advance, not same-day</small>
                  </span>
                </label>
              </div>

              {formData.business.requireAdvanceBooking && (
                <div className="form-group">
                  <label htmlFor="advanceBookingHours">Minimum advance booking time (hours)</label>
                  <input
                    type="number"
                    id="advanceBookingHours"
                    value={formData.business.advanceBookingHours}
                    onChange={(e) => handleBusinessChange('advanceBookingHours', parseInt(e.target.value))}
                    min="1"
                    max="168"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="maxBookingDays">Maximum booking window (days ahead)</label>
                <input
                  type="number"
                  id="maxBookingDays"
                  value={formData.business.maxBookingDays}
                  onChange={(e) => handleBusinessChange('maxBookingDays', parseInt(e.target.value))}
                  min="1"
                  max="365"
                />
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="form-section">
            <h3 className="form-section-title">Cancellation Policy</h3>
            
            <div className="preference-group">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.business.allowCancellations}
                    onChange={(e) => handleBusinessChange('allowCancellations', e.target.checked)}
                  />
                  <span className="preference-text">
                    <strong>Allow cancellations</strong>
                    <small>Players can cancel their bookings</small>
                  </span>
                </label>
              </div>

              {formData.business.allowCancellations && (
                <div className="form-group">
                  <label htmlFor="cancellationDeadlineHours">Cancellation deadline (hours before)</label>
                  <input
                    type="number"
                    id="cancellationDeadlineHours"
                    value={formData.business.cancellationDeadlineHours}
                    onChange={(e) => handleBusinessChange('cancellationDeadlineHours', parseInt(e.target.value))}
                    min="0"
                    max="168"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Settings */}
          <div className="form-section">
            <h3 className="form-section-title">Payment Settings</h3>
            
            <div className="preference-group">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.business.requireDeposit}
                    onChange={(e) => handleBusinessChange('requireDeposit', e.target.checked)}
                  />
                  <span className="preference-text">
                    <strong>Require deposit</strong>
                    <small>Require upfront payment to secure bookings</small>
                  </span>
                </label>
              </div>

              {formData.business.requireDeposit && (
                <div className="form-group">
                  <label htmlFor="depositPercentage">Deposit percentage (%)</label>
                  <input
                    type="number"
                    id="depositPercentage"
                    value={formData.business.depositPercentage}
                    onChange={(e) => handleBusinessChange('depositPercentage', parseInt(e.target.value))}
                    min="10"
                    max="100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="form-section">
            <h3 className="form-section-title">Notification Preferences</h3>
            
            <div className="preference-group">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.bookingRequests}
                    onChange={() => handleNotificationChange('bookingRequests')}
                  />
                  <span className="preference-text">
                    <strong>Booking requests</strong>
                    <small>New booking requests from players</small>
                  </span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.cancellations}
                    onChange={() => handleNotificationChange('cancellations')}
                  />
                  <span className="preference-text">
                    <strong>Cancellations</strong>
                    <small>When players cancel their bookings</small>
                  </span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.payments}
                    onChange={() => handleNotificationChange('payments')}
                  />
                  <span className="preference-text">
                    <strong>Payments</strong>
                    <small>Payment confirmations and issues</small>
                  </span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.reviews}
                    onChange={() => handleNotificationChange('reviews')}
                  />
                  <span className="preference-text">
                    <strong>Reviews</strong>
                    <small>New reviews from players</small>
                  </span>
                </label>
              </div>
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Delivery Methods</h4>
            <div className="preference-group">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <span className="preference-text">Email notifications</span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <span className="preference-text">Push notifications</span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <span className="preference-text">SMS notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="form-section">
            <h3 className="form-section-title">Privacy & Visibility</h3>
            
            <div className="preference-group">
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.privacy.showInSearch}
                    onChange={() => handlePrivacyChange('showInSearch')}
                  />
                  <span className="preference-text">
                    <strong>Show in search results</strong>
                    <small>Allow players to find your venue in searches</small>
                  </span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.privacy.showContactInfo}
                    onChange={() => handlePrivacyChange('showContactInfo')}
                  />
                  <span className="preference-text">
                    <strong>Show contact information</strong>
                    <small>Display phone and email to players</small>
                  </span>
                </label>
              </div>

              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.privacy.allowReviews}
                    onChange={() => handlePrivacyChange('allowReviews')}
                  />
                  <span className="preference-text">
                    <strong>Allow reviews</strong>
                    <small>Players can leave reviews and ratings</small>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
        </form>
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

export default BusinessPreferences;
