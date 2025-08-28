import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LocationSelect from '../common/LocationSelect';
import './VenueDetails.css';

const VenueDetails = ({ data, onNext, onPrevious, onStepData }) => {
  const { updateVenueDetails } = useAuth();
  const [formData, setFormData] = useState({
    venueName: data?.venueName || '',
    venueAddress: data?.venueAddress || '',
    venuePhone: data?.venuePhone || '',
    numberOfCourts: data?.numberOfCourts || '1',
    courtType: data?.courtType || '',
    pricePerHour: data?.pricePerHour || '',
    amenities: data?.amenities || [],
    description: data?.description || '',
    photos: data?.photos || [],
    operatingHours: data?.operatingHours || {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '22:00', closed: false },
      sunday: { open: '06:00', close: '22:00', closed: false }
    },
    location: data?.location || { coordinates: [0, 0] }
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (formData.photos.length + files.length > maxFiles) {
      setErrors(prev => ({ ...prev, photos: `Maximum ${maxFiles} photos allowed` }));
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, photos: 'Each photo must be less than 5MB' }));
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photos: 'Only image files are allowed' }));
        return false;
      }
      return true;
    });
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    if (errors.photos) {
      setErrors(prev => ({ ...prev, photos: '' }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
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
      const venueData = {
        name: formData.venueName,
        description: formData.description,
        address: formData.venueAddress,
        phone: formData.venuePhone || null,
        price_per_hour: parseFloat(formData.pricePerHour),
        number_of_courts: parseInt(formData.numberOfCourts),
        amenities: formData.amenities,
        operating_hours: Object.entries(formData.operatingHours).reduce((acc, [day, hours]) => {
          if (!hours.closed) {
            acc[day] = `${hours.open}-${hours.close}`;
          }
          return acc;
        }, {}),
        photos: formData.photos,
        location: {
          coordinates: formData.location.coordinates
        }
      };

      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venueData)
      });

      const result = await response.json();

      if (result.success) {
        onStepData(formData);
        onNext();
      } else {
        setErrors({ submit: result.message || 'Failed to submit venue for review' });
      }
    } catch (error) {
      console.error('Failed to submit venue:', error);
      setErrors({ submit: 'Failed to submit venue. Please try again.' });
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
            <LocationSelect
              id="venueAddress"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleInputChange}
              className={errors.venueAddress ? 'error' : ''}
              placeholder="Select or type your venue's address"
              error={!!errors.venueAddress}
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

          {/* Operating Hours */}
          <div className="form-group">
            <label>Operating Hours</label>
            <p className="form-description">Set your venue's operating hours for each day</p>
            <div className="operating-hours">
              {daysOfWeek.map(({ key, label }) => (
                <div key={key} className="day-hours">
                  <div className="day-header">
                    <label className="day-label">{label}</label>
                    <label className="closed-toggle">
                      <input
                        type="checkbox"
                        checked={formData.operatingHours[key]?.closed || false}
                        onChange={() => handleDayToggle(key)}
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                  {!formData.operatingHours[key]?.closed && (
                    <div className="time-inputs">
                      <input
                        type="time"
                        value={formData.operatingHours[key]?.open || '06:00'}
                        onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                        className="time-input"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={formData.operatingHours[key]?.close || '22:00'}
                        onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                        className="time-input"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label htmlFor="photos">Venue Photos</label>
            <p className="form-description">Upload up to 5 photos of your venue (max 5MB each)</p>
            
            <div className="photo-upload-area">
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="photo-input"
                style={{ display: 'none' }}
              />
              
              <label htmlFor="photos" className="photo-upload-button">
                <div className="upload-icon">📷</div>
                <div>Click to upload photos</div>
                <div className="upload-hint">JPG, PNG, GIF up to 5MB</div>
              </label>
            </div>
            
            {formData.photos.length > 0 && (
              <div className="photo-preview-grid">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="photo-preview">
                    <img src={photo} alt={`Venue photo ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-photo"
                      onClick={() => removeImage(index)}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.photos && <span className="error-message">{errors.photos}</span>}
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
