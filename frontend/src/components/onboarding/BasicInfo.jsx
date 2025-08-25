import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const BasicInfo = ({ data, onNext, onPrevious, onStepData, isFirstStep }) => {
  const { updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    dateOfBirth: data?.dateOfBirth || '',
    gender: data?.gender || '',
    city: data?.city || ''
  });
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
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender selection is required';
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
      // Update profile with basic info
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        location: { city: formData.city }
      });

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
        <h2>Tell us about yourself</h2>
        <p>Help us personalize your MaBar experience</p>

        <form className="basic-info-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={errors.dateOfBirth ? 'error' : ''}
            />
            {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={errors.gender ? 'error' : ''}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={errors.city ? 'error' : ''}
              placeholder="Enter your city"
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
