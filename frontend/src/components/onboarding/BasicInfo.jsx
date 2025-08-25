import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LocationSelect from '../common/LocationSelect';

const BasicInfo = ({ data, onNext, onPrevious, onStepData, isFirstStep, user }) => {
  const { updateProfile } = useAuth();

  // Helper function to ensure date is in correct format for HTML date input
  const formatDateForInput = (dateValue) => {
    if (!dateValue || dateValue === null || dateValue === undefined) return '';

    try {
      // If it's already in YYYY-MM-DD format, validate it's a real date
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const testDate = new Date(dateValue);
        if (isNaN(testDate.getTime())) return '';

        // Additional validation: ensure the date string represents the same date
        // This catches cases like "2000-02-30" which becomes "2000-03-01"
        const formatted = testDate.toISOString().split('T')[0];
        if (formatted !== dateValue) return '';

        return dateValue;
      }

      // Otherwise, convert to proper format
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';

      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Get persisted form data from localStorage
  const getPersistedFormData = () => {
    try {
      const saved = localStorage.getItem('quickStartFormData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading persisted form data:', error);
    }
    return null;
  };

  // Initialize form data with persisted data, OAuth data, or props
  const [formData, setFormData] = useState(() => {
    const persisted = getPersistedFormData();
    if (persisted) {
      return persisted;
    }

    return {
      firstName: data?.firstName || user?.firstName || '',
      skillLevel: data?.skillLevel || user?.skillLevel || '',
      city: data?.city || user?.location?.city || ''
    };
  });

  // Update form data when user data becomes available (OAuth data loading)
  useEffect(() => {
    if (user && !getPersistedFormData()) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        city: prev.city || user.location?.city || ''
      }));
    }
  }, [user]);

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quickStartFormData', JSON.stringify(formData));
  }, [formData]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Skill level is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Update profile with essential info only
      await updateProfile({
        firstName: formData.firstName,
        skillLevel: formData.skillLevel,
        location: { city: formData.city }
      });

      // Clear persisted data on successful submission
      localStorage.removeItem('quickStartFormData');

      onStepData(formData);
      onNext();
    } catch (error) {
      console.error('Failed to update basic info:', error);
      setErrors({ submit: 'Failed to save information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="basic-info">
      <div className="step-content">
        <h2>Quick Start</h2>
        <p>Just 3 quick details to get you started playing!</p>

        <form className="basic-info-form">
          <div className="form-group">
            <label htmlFor="firstName">What should we call you? *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="Your first name"
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="skillLevel">What's your skill level? *</label>
            <select
              id="skillLevel"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleInputChange}
              className={errors.skillLevel ? 'error' : ''}
            >
              <option value="">Select your skill level</option>
              <option value="1">1 - Beginner (Just starting out)</option>
              <option value="2">2 - Novice (Learning the basics)</option>
              <option value="3">3 - Beginner+ (Getting comfortable)</option>
              <option value="4">4 - Intermediate- (Developing skills)</option>
              <option value="5">5 - Intermediate (Solid fundamentals)</option>
              <option value="6">6 - Intermediate+ (Good technique)</option>
              <option value="7">7 - Advanced- (Strong player)</option>
              <option value="8">8 - Advanced (Very skilled)</option>
              <option value="9">9 - Expert (Exceptional player)</option>
              <option value="10">10 - Professional (Tournament level)</option>
            </select>
            {errors.skillLevel && <span className="error-message">{errors.skillLevel}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">Where do you play? *</label>
            <LocationSelect
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              error={!!errors.city}
              placeholder="Select your location in Jakarta"
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
        </form>
      </div>

      <div className="step-navigation">
        {!isFirstStep && (
          <button 
            className="btn btn-secondary"
            onClick={onPrevious}
            disabled={loading}
          >
            Previous
          </button>
        )}
        
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

export default BasicInfo;
