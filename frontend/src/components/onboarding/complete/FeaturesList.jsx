import './FeaturesList.css';

/**
 * FeaturesList Component
 * Displays a list of features or next steps with icons and animations
 */
const FeaturesList = ({ 
  title = "What's next?", 
  features = [], 
  icon = "🎯",
  animateOnMount = true 
}) => {
  return (
    <div className="features-list-container">
      <h3 className="features-title">{title}</h3>
      <ul className={`features-list ${animateOnMount ? 'animate-items' : ''}`}>
        {features.map((feature, index) => (
          <li 
            key={index} 
            className="feature-item"
            style={{ '--animation-delay': `${index * 0.1}s` }}
          >
            <span className="feature-icon">{icon}</span>
            <span className="feature-text">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturesList;
