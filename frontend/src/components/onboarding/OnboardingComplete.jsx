import { useAuth } from '../../context/AuthContext';
import { useWelcomeMessage, useRoleTip } from '../../hooks/useWelcomeMessage';
import { useProfileSummary } from '../../hooks/useProfileSummary';
import { usePolicyValidation, useCompletionValidation } from '../../hooks/usePolicyValidation';

// Import refactored components
import CompletionAnimation from './complete/CompletionAnimation';
import ProfileSummary from './complete/ProfileSummary';
import FeaturesList from './complete/FeaturesList';
import PolicySection from './complete/PolicySection';
import TipCard from './complete/TipCard';

// Import enhanced styles
import './complete/OnboardingComplete.css';

const OnboardingComplete = ({ onComplete, onPrevious, isFirstStep, user }) => {
  const { loading } = useAuth();

  // Use custom hooks for business logic
  const welcomeData = useWelcomeMessage(user);
  const profileSummaryItems = useProfileSummary(user);
  const tipData = useRoleTip(user);

  const {
    isValidForCompletion,
    validationMessage,
    policiesRequired,
    handleAllPoliciesAcceptance
  } = usePolicyValidation(user);

  const { canComplete } = useCompletionValidation(user, isValidForCompletion);

  const handleComplete = () => {
    if (!canComplete) {
      return;
    }
    onComplete();
  };

  return (
    <div className="onboarding-complete">
      <div className="step-content">
        <CompletionAnimation
          icon="✅"
          showCelebration={true}
          animationDelay={200}
        />

        <h2>{welcomeData.title}</h2>
        <p className="completion-subtitle">{welcomeData.subtitle}</p>

        <ProfileSummary
          user={user}
          customItems={profileSummaryItems}
        />

        <FeaturesList
          title="What's next?"
          features={welcomeData.features}
          icon="🎯"
          animateOnMount={true}
        />

        {policiesRequired && (
          <PolicySection
            onAcceptanceChange={handleAllPoliciesAcceptance}
            title="Terms and Policies"
            additionalText="I understand that my venue will be listed publicly and I am responsible for managing bookings and maintaining accurate information."
          />
        )}

        <TipCard
          title={tipData.title}
          content={tipData.content}
          variant="info"
        />
      </div>

      <div className="step-navigation">
        <div className="button-container">
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
            className="btn btn-primary btn-large"
            onClick={handleComplete}
            disabled={loading || !canComplete}
          >
            {loading ? 'Setting up...' : 'Enter MaBar Dashboard'}
          </button>
        </div>

        {validationMessage && (
          <p className="policy-warning">{validationMessage}</p>
        )}
      </div>
    </div>
  );
};

export default OnboardingComplete;
