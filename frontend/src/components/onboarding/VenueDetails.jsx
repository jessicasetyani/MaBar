import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const VenueDetails = ({ data, onNext, onPrevious, onStepData }) => {
  const { updateVenueDetails } = useAuth();
  const [formData, setFormData] = useState({
    numberOfCourts: data?.numberOfCourts || '1',
    courtType: data?.courtType || '',
    pricePerHour: data?.pricePerHour || '',
    amenities: data?.amenities || [],
    description: data?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableAmenities = [
    'Parking', 'Changing Rooms', 'Showers', 'Equipment Rental',
    'Pro Shop', 'Cafe/Restaurant', 'Air Conditioning', 'LED Lighting',
    'Spectator Seating', 'WiFi', 'Lockers', 'First Aid',
    'Security Cameras', 'Online Booking', 'Ball Machine', 'Coaching Available'
  ];

  const courtTypes = [
    'Indoor Glass Courts',
    'Outdoor Glass Courts',
    'Indoor Concrete Courts',
    'Outdoor Concrete Courts',
    'Artificial Grass Courts',
    'Mixed (Indoor & Outdoor)'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
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

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          closed: !prev.operatingHours[day].closed
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numberOfCourts || formData.numberOfCourts <= 0) {
      newErrors.numberOfCourts = 'Please enter the number of courts';
    }

    if (!formData.courtType) {
      newErrors.courtType = 'Please select a court type';
    }

    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Please enter a valid price per hour';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a venue description';
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
        numberOfCourts: parseInt(formData.numberOfCourts),
        courtType: formData.courtType,
        pricePerHour: parseFloat(formData.pricePerHour),
        amenities: formData.amenities,
        description: formData.description
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
          {/* Basic Venue Information */}
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

          <div className="form-group">
            <label htmlFor="description">Venue Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe your venue, facilities, and what makes it special..."
              rows="4"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Contact and Pricing */}
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
              <label htmlFor="pricePerHour">Price per Hour (Rp) *</label>
              <input
                type="number"
                id="pricePerHour"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleInputChange}
                className={errors.pricePerHour ? 'error' : ''}
                placeholder="150000"
                min="0"
                step="1000"
              />
              {errors.pricePerHour && <span className="error-message">{errors.pricePerHour}</span>}
            </div>
          </div>

          {/* Court Information */}
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
              />
              {errors.numberOfCourts && <span className="error-message">{errors.numberOfCourts}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="courtType">Court Type *</label>
              <select
                id="courtType"
                name="courtType"
                value={formData.courtType}
                onChange={handleInputChange}
                className={errors.courtType ? 'error' : ''}
              >
                <option value="">Select court type</option>
                {courtTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.courtType && <span className="error-message">{errors.courtType}</span>}
            </div>
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label htmlFor="amenities">Amenities</label>
            <p className="form-description">Select all amenities available at your venue</p>
            <div className="amenities-grid">
              {availableAmenities.map((amenity) => (
                <div
                  key={amenity}
                  className={`amenity-option ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                  onClick={() => handleAmenityToggle(amenity)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAmenityToggle(amenity);
                    }
                  }}
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
