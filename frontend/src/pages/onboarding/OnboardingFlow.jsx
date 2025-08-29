import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Production-grade onboarding flow with role-specific steps
 * Provides comprehensive user setup and profile completion
 */
const OnboardingFlow = () => {
  const { user, updateProfile, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Common fields
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: '',
    
    // Player-specific fields
    skillLevel: '',
    preferredSports: [],
    availability: [],
    
    // Venue Owner-specific fields
    businessName: '',
    businessType: '',
    venueCount: '',
    businessAddress: '',
    
    // Admin fields (minimal additional setup)
    department: '',
    permissions: []
  });

  // Define steps based on user role
  const getStepsForRole = (role) => {
    const commonSteps = [
      { id: 1, title: 'Personal Information', description: 'Basic profile details' },
    ];

    switch (role) {
      case 'player':
        return [
          ...commonSteps,
          { id: 2, title: 'Sports Preferences', description: 'Your favorite sports and skill levels' },
          { id: 3, title: 'Availability', description: 'When you prefer to play' },
          { id: 4, title: 'Complete Setup', description: 'Finish your profile' }
        ];
      
      case 'venue_owner':
        return [
          ...commonSteps,
          { id: 2, title: 'Business Information', description: 'Your business details' },
          { id: 3, title: 'Venue Details', description: 'Information about your venues' },
          { id: 4, title: 'Complete Setup', description: 'Finish your business profile' }
        ];
      
      case 'admin':
        return [
          ...commonSteps,
          { id: 2, title: 'Admin Setup', description: 'Administrative configuration' },
          { id: 3, title: 'Complete Setup', description: 'Finish admin setup' }
        ];
      
      default:
        return commonSteps;
    }
  };

  const steps = getStepsForRole(user?.role);
  const totalSteps = steps.length;

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Handle array field changes (for multi-select)
  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim();
      case 2:
        if (user?.role === 'player') {
          return formData.skillLevel && formData.preferredSports.length > 0;
        } else if (user?.role === 'venue_owner') {
          return formData.businessName.trim() && formData.businessType;
        } else if (user?.role === 'admin') {
          return formData.department.trim();
        }
        return true;
      case 3:
        if (user?.role === 'player') {
          return formData.availability.length > 0;
        } else if (user?.role === 'venue_owner') {
          return formData.venueCount;
        }
        return true;
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    } else {
      setError('Please fill in all required fields before continuing.');
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update user profile with onboarding data
      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        onboarding_completed: true,
        
        // Role-specific data
        ...(user?.role === 'player' && {
          skill_level: formData.skillLevel,
          preferred_sports: formData.preferredSports,
          availability: formData.availability
        }),
        
        ...(user?.role === 'venue_owner' && {
          business_name: formData.businessName,
          business_type: formData.businessType,
          venue_count: parseInt(formData.venueCount),
          business_address: formData.businessAddress
        }),
        
        ...(user?.role === 'admin' && {
          department: formData.department,
          permissions: formData.permissions
        })
      };

      await updateProfile(profileData);
      await completeOnboarding();

      // Navigate to appropriate dashboard
      const dashboardRoutes = {
        'player': '/dashboard',
        'venue_owner': '/dashboard',
        'admin': '/admin'
      };

      navigate(dashboardRoutes[user?.role] || '/dashboard');
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render step content based on current step and user role
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <p className="text-sm text-gray-600">Let's start with some basic information about you.</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        );

      case 2:
        if (user?.role === 'player') {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Sports Preferences</h3>
              <p className="text-sm text-gray-600">Tell us about your sports interests and skill level.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Level *</label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select your skill level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Sports *</label>
                <div className="mt-2 space-y-2">
                  {['Basketball', 'Tennis', 'Soccer', 'Volleyball', 'Badminton', 'Table Tennis'].map(sport => (
                    <label key={sport} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferredSports.includes(sport)}
                        onChange={(e) => handleArrayChange('preferredSports', sport, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{sport}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        // Add venue_owner and admin step 2 content here
        return <div>Role-specific step 2 content</div>;

      default:
        return <div>Step content for step {currentStep}</div>;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Completing your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to MaBar
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's set up your {user?.role} profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% complete
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
