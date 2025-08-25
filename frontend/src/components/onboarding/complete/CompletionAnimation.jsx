import { useEffect, useState } from 'react';
import './CompletionAnimation.css';

/**
 * CompletionAnimation Component
 * Displays an animated success icon with optional celebration effects
 */
const CompletionAnimation = ({ 
  icon = "✅", 
  showCelebration = true,
  animationDelay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (showCelebration) {
        setTimeout(() => setShowConfetti(true), 300);
      }
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay, showCelebration]);

  return (
    <div className="completion-animation">
      <div className={`success-icon ${isVisible ? 'animate-in' : ''}`}>
        {icon}
      </div>
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="confetti-piece" 
              style={{
                '--delay': `${i * 0.1}s`,
                '--rotation': `${Math.random() * 360}deg`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletionAnimation;
