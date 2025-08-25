import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/StepIndicator';
import RoleSelection from '../components/onboarding/RoleSelection';
import BasicInfo from '../components/onboarding/BasicInfo';
import BusinessContact from '../components/onboarding/BusinessContact';
import OnboardingComplete from '../components/onboarding/OnboardingComplete';

const OnboardingPage = () => {
  const { user, isAuthenticated, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    basicInfo: {},
    businessContact: {},
    skillAssessment: {},
    venueDetails: {},
    preferences: {},
    businessPreferences: {}
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect if onboarding already completed
    if (user && user.onboardingCompleted) {
      navigate('/dashboard');
      return;
    }

    // Set initial step based on user's onboarding progress
    if (user && user.onboardingStep) {
      setCurrentStep(user.onboardingStep);
    }

    // Pre-fill form data with existing user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        role: user.role || '',
        basicInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          city: user.location?.city || ''
        }
      }));
    }
  }, [user, isAuthenticated, navigate]);

  const getStepsForRole = (role) => {
    console.log('getStepsForRole called with role:', role);
    if (role === 'venue_owner') {
      console.log('Returning venue owner steps');
      // Optimized Venue Owner Flow: Essential setup only
      return [
        { number: 1, title: 'Role Selection', component: RoleSelection },
        { number: 2, title: 'Venue Setup', component: BusinessContact },
        { number: 3, title: 'Complete', component: OnboardingComplete }
      ];
    } else {
      console.log('Returning player steps for role:', role);
      // Optimized Player Flow: Minimal friction to first booking
      return [
        { number: 1, title: 'Role Selection', component: RoleSelection },
        { number: 2, title: 'Quick Start', component: BasicInfo },
        { number: 3, title: 'Complete', component: OnboardingComplete }
      ];
    }
  };

  // Use useMemo to ensure steps update when role changes
  const steps = useMemo(() => {
    const currentRole = formData.role || user?.role;
    console.log('Calculating steps for role:', currentRole);
    return getStepsForRole(currentRole);
  }, [formData.role, user?.role]);

  // Sync formData.role with user.role when user role is updated
  useEffect(() => {
    if (user?.role && formData.role !== user.role) {
      console.log('Syncing formData role with user role:', user.role);
      setFormData(prev => ({
        ...prev,
        role: user.role
      }));
    }
  }, [user?.role, formData.role]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData) => {
    const stepKey = getStepKey(currentStep);
    setFormData(prev => ({
      ...prev,
      [stepKey]: stepData
    }));
  };

  const getStepKey = (step) => {
    const currentRole = formData.role || user?.role;

    if (currentRole === 'venue_owner') {
      switch (step) {
        case 1: return 'role';
        case 2: return 'venueSetup';
        default: return '';
      }
    } else {
      // Optimized Player flow
      switch (step) {
        case 1: return 'role';
        case 2: return 'quickStart';
        default: return '';
      }
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding();
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  // Memoize the step data to prevent unnecessary re-renders that cause field resets
  const stepData = useMemo(() => {
    return formData[getStepKey(currentStep)] || {};
  }, [formData, currentStep]);

  if (!isAuthenticated || !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Welcome to MaBar! 🏓</h1>
          <p>Let's set up your profile to get you started</p>
        </div>

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
        />

        <div className="onboarding-content">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={stepData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onStepData={handleStepData}
              onComplete={handleComplete}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === steps.length}
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
