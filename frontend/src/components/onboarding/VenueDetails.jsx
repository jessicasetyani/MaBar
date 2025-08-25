import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const VenueDetails = ({ data, onNext, onPrevious, onStepData }) => {
  const { updateVenueDetails } = useAuth();
  const [formData, setFormData] = useState({
    venueName: data?.venueName || '',
    venueAddress: data?.venueAddress || '',
    venuePhone: data?.venuePhone || '',
    pricePerHour: data?.pricePerHour || '',
    amenities: data?.amenities || []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableAmenities = [
    'Parking', 'Changing Rooms', 'Showers', 'Equipment Rental',
    'Pro Shop', 'Cafe/Restaurant', 'Air Conditioning', 'Lighting',
    'Spectator Seating', 'WiFi', 'Lockers', 'First Aid'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.venueName.trim()) {
      newErrors.venueName = 'Venue name is required';
    }
    
    if (!formData.venueAddress.trim()) {
      newErrors.venueAddress = 'Venue address is required';
    }
    
    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Please enter a valid price per hour';
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
      await updateVenueDetails({
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        venuePhone: formData.venuePhone,
        pricePerHour: parseFloat(formData.pricePerHour),
        amenities: formData.amenities
      });

      onStepData(formData);
      onNext();
    } catch (error) {
      console.error('Failed to update venue details:', error);
      setErrors({ submit: 'Failed to save venue details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venue-details">
      <div className="step-content">
        <h2>Tell us about your venue</h2>
        <p>Help players discover and book your courts</p>

        <form className="venue-form">
          <div className="form-group">
            <label htmlFor="venueName">Venue Name *</label>
            <input
              type="text"
              id="venueName"
              name="venueName"
              value={formData.venueName}
              onChange={handleInputChange}
              className={errors.venueName ? 'error' : ''}
              placeholder="Enter your venue name"
            />
            {errors.venueName && <span className="error-message">{errors.venueName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="venueAddress">Address *</label>
            <textarea
              id="venueAddress"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleInputChange}
              className={errors.venueAddress ? 'error' : ''}
              placeholder="Enter your venue's full address"
              rows="3"
            />
            {errors.venueAddress && <span className="error-message">{errors.venueAddress}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="venuePhone">Phone Number</label>
              <input
                type="tel"
                id="venuePhone"
                name="venuePhone"
                value={formData.venuePhone}
                onChange={handleInputChange}
                placeholder="Enter contact number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricePerHour">Price per Hour ($) *</label>
              <input
                type="number"
                id="pricePerHour"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleInputChange}
                className={errors.pricePerHour ? 'error' : ''}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.pricePerHour && <span className="error-message">{errors.pricePerHour}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <p className="form-description">Select all amenities available at your venue</p>
            <div className="amenities-grid">
              {availableAmenities.map((amenity) => (
                <div 
                  key={amenity}
                  className={`amenity-option ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                  onClick={() => handleAmenityToggle(amenity)}
                >
                  <span className="amenity-checkbox">
                    {formData.amenities.includes(amenity) ? '✓' : ''}
                  </span>
                  <span className="amenity-label">{amenity}</span>
                </div>
              ))}
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

export default VenueDetails;
