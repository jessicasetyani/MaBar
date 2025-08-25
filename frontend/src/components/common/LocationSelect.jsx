import { useState, useRef, useEffect } from 'react';
import { JAKARTA_LOCATIONS, getLocationsByArea, searchLocations } from '../../utils/locations';
import './LocationSelect.css';

/**
 * LocationSelect Component
 * A searchable dropdown for Jakarta locations with grouped options
 */
const LocationSelect = ({ 
  value, 
  onChange, 
  name, 
  id, 
  className = '', 
  placeholder = 'Select your location',
  error = false,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(JAKARTA_LOCATIONS);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Get display value for selected location
  const getDisplayValue = () => {
    if (!value) return '';
    const location = JAKARTA_LOCATIONS.find(loc => loc.value === value);
    return location ? location.label : value;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredLocations(searchLocations(query));
    setHighlightedIndex(-1);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    onChange({
      target: {
        name,
        value: location.value
      }
    });
    setSearchQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchQuery('');
    setFilteredLocations(JAKARTA_LOCATIONS);
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    // Delay closing to allow for option selection
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFilteredLocations(JAKARTA_LOCATIONS);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredLocations[highlightedIndex]) {
          handleLocationSelect(filteredLocations[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupedLocations = getLocationsByArea();

  return (
    <div 
      className={`location-select ${className} ${error ? 'error' : ''} ${isOpen ? 'open' : ''}`}
      ref={dropdownRef}
    >
      <div className="location-select__input-container">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={isOpen ? searchQuery : getDisplayValue()}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="location-select__input"
          autoComplete="off"
        />
        <div className="location-select__arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="location-select__dropdown">
          <div className="location-select__list" ref={listRef}>
            {filteredLocations.length > 0 ? (
              searchQuery ? (
                // Show flat list when searching
                filteredLocations.map((location, index) => (
                  <div
                    key={location.value}
                    className={`location-select__option ${index === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleLocationSelect(location)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {location.label}
                  </div>
                ))
              ) : (
                // Show grouped list when not searching
                Object.entries(groupedLocations).map(([area, locations]) => (
                  <div key={area} className="location-select__group">
                    <div className="location-select__group-label">{area}</div>
                    {locations.map((location) => {
                      const flatIndex = filteredLocations.findIndex(loc => loc.value === location.value);
                      return (
                        <div
                          key={location.value}
                          className={`location-select__option ${flatIndex === highlightedIndex ? 'highlighted' : ''}`}
                          onClick={() => handleLocationSelect(location)}
                          onMouseEnter={() => setHighlightedIndex(flatIndex)}
                        >
                          {location.label}
                        </div>
                      );
                    })}
                  </div>
                ))
              )
            ) : (
              <div className="location-select__no-results">
                No locations found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelect;
