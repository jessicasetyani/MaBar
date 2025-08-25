import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatIDR, parseIDR, validateIDR } from '../../utils/currency';

const BusinessContact = ({ data, onNext, onPrevious, onStepData }) => {
  const { updateVenueDetails } = useAuth();
  const [formData, setFormData] = useState({
    // Essential Business Information Only
    businessName: data?.businessName || '',
    contactName: data?.contactName || '',
    contactPhone: data?.contactPhone || '',
    venueAddress: data?.venueAddress || '',
    numberOfCourts: data?.numberOfCourts || '1',
    pricePerHour: data?.pricePerHour || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});



  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for price input to format IDR
    if (name === 'pricePerHour') {
      const numericValue = parseIDR(value);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business/Venue name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }

    if (!formData.venueAddress.trim()) {
      newErrors.venueAddress = 'Venue address is required';
    }

    if (!formData.numberOfCourts || formData.numberOfCourts <= 0) {
      newErrors.numberOfCourts = 'Number of courts is required';
    }

    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Price per hour is required';
    } else {
      const priceValidation = validateIDR(formData.pricePerHour, 10000, 1000000);
      if (!priceValidation.isValid) {
        newErrors.pricePerHour = priceValidation.message;
      }
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
      // Update venue details with essential business information
      await updateVenueDetails({
        venueName: formData.businessName,
        venueAddress: formData.venueAddress,
        venuePhone: formData.contactPhone,
        pricePerHour: parseFloat(formData.pricePerHour),
        numberOfCourts: parseInt(formData.numberOfCourts)
      });

      onStepData(formData);
      onNext();
    } catch (error) {
      console.error('Failed to update business contact:', error);
      setErrors({ submit: 'Failed to save business information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-contact">
      <div className="step-content">
        <h2>Essential Venue Setup</h2>
        <p>Just the basics to get your venue listed and accepting bookings</p>

        <form className="business-contact-form">
          <div className="form-group">
            <label htmlFor="businessName">Venue Name *</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className={errors.businessName ? 'error' : ''}
              placeholder="Your venue name"
            />
            {errors.businessName && <span className="error-message">{errors.businessName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactName">Contact Person *</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              className={errors.contactName ? 'error' : ''}
              placeholder="Your full name"
            />
            {errors.contactName && <span className="error-message">{errors.contactName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone *</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className={errors.contactPhone ? 'error' : ''}
              placeholder="Phone number for bookings"
            />
            {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="venueAddress">Venue Address *</label>
            <textarea
              id="venueAddress"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleInputChange}
              className={errors.venueAddress ? 'error' : ''}
              placeholder="Full venue address including city, state, and postal code"
              rows="3"
            />
            {errors.venueAddress && <span className="error-message">{errors.venueAddress}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfCourts">Number of Courts *</label>
              <input
                type="number"
                id="numberOfCourts"
                name="numberOfCourts"
                value={formData.numberOfCourts}
                onChange={handleInputChange}
                className={errors.numberOfCourts ? 'error' : ''}
                placeholder="1"
                min="1"
                max="20"
              />
              {errors.numberOfCourts && <span className="error-message">{errors.numberOfCourts}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pricePerHour">Price per Hour (Rp) *</label>
              <input
                type="text"
                id="pricePerHour"
                name="pricePerHour"
                value={formData.pricePerHour ? formatIDR(formData.pricePerHour, false) : ''}
                onChange={handleInputChange}
                className={errors.pricePerHour ? 'error' : ''}
                placeholder="150.000"
              />
              {errors.pricePerHour && <span className="error-message">{errors.pricePerHour}</span>}
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

export default BusinessContact;
