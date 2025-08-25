import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/StepIndicator';
import RoleSelection from '../components/onboarding/RoleSelection';
import BasicInfo from '../components/onboarding/BasicInfo';
import SkillAssessment from '../components/onboarding/SkillAssessment';
import VenueDetails from '../components/onboarding/VenueDetails';
import Preferences from '../components/onboarding/Preferences';
import OnboardingComplete from '../components/onboarding/OnboardingComplete';

const OnboardingPage = () => {
  const { user, isAuthenticated, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    basicInfo: {},
    skillAssessment: {},
    venueDetails: {},
    preferences: {}
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

  const steps = [
    { number: 1, title: 'Role Selection', component: RoleSelection },
    { number: 2, title: 'Basic Information', component: BasicInfo },
    { 
      number: 3, 
      title: user?.role === 'venue_owner' ? 'Venue Details' : 'Skill Assessment',
      component: user?.role === 'venue_owner' ? VenueDetails : SkillAssessment
    },
    { number: 4, title: 'Preferences', component: Preferences },
    { number: 5, title: 'Complete', component: OnboardingComplete }
  ];

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
    switch (step) {
      case 1: return 'role';
      case 2: return 'basicInfo';
      case 3: return user?.role === 'venue_owner' ? 'venueDetails' : 'skillAssessment';
      case 4: return 'preferences';
      default: return '';
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
              data={formData[getStepKey(currentStep)]}
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
