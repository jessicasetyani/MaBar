import { useState } from 'react';
import './PolicySection.css';

/**
 * PolicySection Component
 * Displays terms and policies with checkbox acceptance for venue owners
 */
const PolicySection = ({ 
  onAcceptanceChange,
  title = "Terms and Policies",
  policies = [
    { name: "Terms of Service", required: true },
    { name: "Privacy Policy", required: true },
    { name: "Venue Owner Guidelines", required: true }
  ],
  additionalText = "I understand that my venue will be listed publicly and I am responsible for managing bookings and maintaining accurate information."
}) => {
  const [accepted, setAccepted] = useState(false);

  const handleAcceptanceChange = (isAccepted) => {
    setAccepted(isAccepted);
    onAcceptanceChange?.(isAccepted);
  };

  const requiredPolicies = policies.filter(policy => policy.required);
  const optionalPolicies = policies.filter(policy => !policy.required);

  return (
    <div className="policy-section">
      <h3 className="policy-title">{title}</h3>
      <div className="policy-card">
        <div className="policy-item">
          <label className="policy-label">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => handleAcceptanceChange(e.target.checked)}
              className="policy-checkbox"
            />
            <span className="policy-text">
              I agree to the{' '}
              {requiredPolicies.map((policy, index) => (
                <span key={policy.name}>
                  <strong>{policy.name}</strong>
                  {index < requiredPolicies.length - 1 && ', '}
                  {index === requiredPolicies.length - 2 && requiredPolicies.length > 2 && ', and '}
                  {index === requiredPolicies.length - 2 && requiredPolicies.length === 2 && ' and '}
                </span>
              ))}
              {optionalPolicies.length > 0 && (
                <>
                  {requiredPolicies.length > 0 && ', and '}
                  {optionalPolicies.map((policy, index) => (
                    <span key={policy.name}>
                      <strong>{policy.name}</strong>
                      {index < optionalPolicies.length - 1 && ', '}
                    </span>
                  ))}
                </>
              )}
              . {additionalText}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PolicySection;
