import './TipCard.css';

/**
 * TipCard Component
 * Displays helpful tips or suggestions with customizable styling
 */
const TipCard = ({ 
  title = "💡 Pro Tip",
  content,
  variant = "default", // default, success, warning, info
  icon,
  className = ""
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'tip-card--success';
      case 'warning':
        return 'tip-card--warning';
      case 'info':
        return 'tip-card--info';
      default:
        return 'tip-card--default';
    }
  };

  return (
    <div className={`tip-card ${getVariantClass()} ${className}`}>
      <h4 className="tip-title">
        {icon && <span className="tip-icon">{icon}</span>}
        {title}
      </h4>
      <div className="tip-content">
        {typeof content === 'string' ? (
          <p>{content}</p>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export default TipCard;
