import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SkillAssessment = ({ data, onNext, onPrevious, onStepData }) => {
  const { updateSkillAssessment } = useAuth();
  const [formData, setFormData] = useState({
    selfRated: data?.selfRated || '',
    yearsPlaying: data?.yearsPlaying || '',
    playingFrequency: data?.playingFrequency || '',
    preferredPlayStyle: data?.preferredPlayStyle || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const skillLevels = [
    { value: 1, label: '1 - Beginner', description: 'Just starting out' },
    { value: 2, label: '2 - Novice', description: 'Learning the basics' },
    { value: 3, label: '3 - Beginner+', description: 'Getting comfortable' },
    { value: 4, label: '4 - Intermediate-', description: 'Developing skills' },
    { value: 5, label: '5 - Intermediate', description: 'Solid fundamentals' },
    { value: 6, label: '6 - Intermediate+', description: 'Good technique' },
    { value: 7, label: '7 - Advanced-', description: 'Strong player' },
    { value: 8, label: '8 - Advanced', description: 'Very skilled' },
    { value: 9, label: '9 - Expert', description: 'Exceptional player' },
    { value: 10, label: '10 - Professional', description: 'Tournament level' }
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.selfRated) {
      newErrors.selfRated = 'Please rate your skill level';
    }
    
    if (!formData.playingFrequency) {
      newErrors.playingFrequency = 'Please select your playing frequency';
    }
    
    if (!formData.preferredPlayStyle) {
      newErrors.preferredPlayStyle = 'Please select your preferred play style';
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
      await updateSkillAssessment({
        selfRated: parseInt(formData.selfRated),
        yearsPlaying: parseInt(formData.yearsPlaying) || 0,
        playingFrequency: formData.playingFrequency,
        preferredPlayStyle: formData.preferredPlayStyle
      });

      onStepData(formData);
      onNext();
    } catch (error) {
      console.error('Failed to update skill assessment:', error);
      setErrors({ submit: 'Failed to save skill assessment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-assessment">
      <div className="step-content">
        <h2>Let's assess your skill level</h2>
        <p>This helps us match you with players of similar abilities</p>

        <form className="skill-form">
          <div className="form-group">
            <label>How would you rate your current skill level? *</label>
            <div className="skill-levels">
              {skillLevels.map((level) => (
                <div 
                  key={level.value}
                  className={`skill-option ${formData.selfRated == level.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange({ target: { name: 'selfRated', value: level.value } })}
                >
                  <div className="skill-number">{level.value}</div>
                  <div className="skill-info">
                    <div className="skill-label">{level.label}</div>
                    <div className="skill-description">{level.description}</div>
                  </div>
                </div>
              ))}
            </div>
            {errors.selfRated && <span className="error-message">{errors.selfRated}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="yearsPlaying">How many years have you been playing padel?</label>
            <select
              id="yearsPlaying"
              name="yearsPlaying"
              value={formData.yearsPlaying}
              onChange={handleInputChange}
            >
              <option value="">Select years of experience</option>
              <option value="0">Less than 1 year</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="3">3 years</option>
              <option value="4">4 years</option>
              <option value="5">5 years</option>
              <option value="10">5-10 years</option>
              <option value="15">10+ years</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="playingFrequency">How often do you play? *</label>
            <select
              id="playingFrequency"
              name="playingFrequency"
              value={formData.playingFrequency}
              onChange={handleInputChange}
              className={errors.playingFrequency ? 'error' : ''}
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="occasionally">Occasionally</option>
            </select>
            {errors.playingFrequency && <span className="error-message">{errors.playingFrequency}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="preferredPlayStyle">What's your preferred play style? *</label>
            <select
              id="preferredPlayStyle"
              name="preferredPlayStyle"
              value={formData.preferredPlayStyle}
              onChange={handleInputChange}
              className={errors.preferredPlayStyle ? 'error' : ''}
            >
              <option value="">Select play style</option>
              <option value="casual">Casual - Just for fun</option>
              <option value="competitive">Competitive - I play to win</option>
              <option value="social">Social - Meet new people</option>
              <option value="training">Training - Improve my skills</option>
            </select>
            {errors.preferredPlayStyle && <span className="error-message">{errors.preferredPlayStyle}</span>}
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

export default SkillAssessment;
