const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="step-indicator">
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.number} className="step-item">
            <div className={`step-circle ${
              step.number < currentStep ? 'completed' : 
              step.number === currentStep ? 'active' : 'pending'
            }`}>
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <div className="step-label">
              <span className="step-title">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${
                step.number < currentStep ? 'completed' : 'pending'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
