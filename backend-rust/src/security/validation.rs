use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Enterprise input validation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationConfig {
    /// Maximum input length for text fields
    pub max_text_length: usize,
    /// Maximum input length for email fields
    pub max_email_length: usize,
    /// Allowed file extensions for uploads
    pub allowed_file_extensions: HashSet<String>,
    /// Maximum file size in bytes
    pub max_file_size: usize,
    /// Enable strict validation mode
    pub strict_mode: bool,
}

impl Default for ValidationConfig {
    fn default() -> Self {
        Self::production_config()
    }
}

impl ValidationConfig {
    /// Production validation configuration
    pub fn production_config() -> Self {
        let mut allowed_extensions = HashSet::new();
        allowed_extensions.insert("jpg".to_string());
        allowed_extensions.insert("jpeg".to_string());
        allowed_extensions.insert("png".to_string());
        allowed_extensions.insert("pdf".to_string());

        Self {
            max_text_length: 1000,
            max_email_length: 254, // RFC 5321 limit
            allowed_file_extensions: allowed_extensions,
            max_file_size: 10 * 1024 * 1024, // 10MB
            strict_mode: true,
        }
    }

    /// Development validation configuration
    pub fn development_config() -> Self {
        let mut config = Self::production_config();
        config.strict_mode = false;
        config.max_text_length = 5000; // More lenient for testing
        config
    }
}

/// Enterprise input validator
pub struct InputValidator {
    config: ValidationConfig,
    email_regex: Regex,
    sql_injection_patterns: Vec<Regex>,
    xss_patterns: Vec<Regex>,
    path_traversal_patterns: Vec<Regex>,
}

impl InputValidator {
    /// Create new input validator
    pub fn new(config: ValidationConfig) -> Self {
        let email_regex = Regex::new(
            r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
        ).unwrap();

        // Simplified validation patterns for local development
        let sql_injection_patterns = vec![
            Regex::new(r"(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)").unwrap(),
        ];

        let xss_patterns = vec![
            Regex::new(r"(?i)<script").unwrap(),
            Regex::new(r"(?i)javascript:").unwrap(),
        ];

        let path_traversal_patterns = vec![
            Regex::new(r"\.\.").unwrap(),
        ];

        Self {
            config,
            email_regex,
            sql_injection_patterns,
            xss_patterns,
            path_traversal_patterns,
        }
    }

    /// Validate email address
    pub fn validate_email(&self, email: &str) -> Result<(), String> {
        if email.is_empty() {
            return Err("Email cannot be empty".to_string());
        }

        if email.len() > self.config.max_email_length {
            return Err(format!("Email too long (max {} characters)", self.config.max_email_length));
        }

        if !self.email_regex.is_match(email) {
            return Err("Invalid email format".to_string());
        }

        // Additional security checks
        if self.config.strict_mode {
            self.check_malicious_patterns(email, "email")?;
        }

        Ok(())
    }

    /// Validate text input
    pub fn validate_text(&self, text: &str, field_name: &str) -> Result<(), String> {
        if text.len() > self.config.max_text_length {
            return Err(format!("{} too long (max {} characters)", field_name, self.config.max_text_length));
        }

        // Security checks
        self.check_malicious_patterns(text, field_name)?;

        Ok(())
    }

    /// Validate password input
    pub fn validate_password_input(&self, password: &str) -> Result<(), String> {
        if password.is_empty() {
            return Err("Password cannot be empty".to_string());
        }

        if password.len() > 128 {
            return Err("Password too long (max 128 characters)".to_string());
        }

        // Check for null bytes and control characters
        if password.contains('\0') || password.chars().any(|c| c.is_control() && c != '\t' && c != '\n' && c != '\r') {
            return Err("Password contains invalid characters".to_string());
        }

        Ok(())
    }

    /// Validate file upload
    pub fn validate_file_upload(&self, filename: &str, file_size: usize) -> Result<(), String> {
        if filename.is_empty() {
            return Err("Filename cannot be empty".to_string());
        }

        // Check file size
        if file_size > self.config.max_file_size {
            return Err(format!("File too large (max {} bytes)", self.config.max_file_size));
        }

        // Check file extension
        if let Some(extension) = filename.split('.').last() {
            let ext = extension.to_lowercase();
            if !self.config.allowed_file_extensions.contains(&ext) {
                return Err(format!("File type '{}' not allowed", ext));
            }
        } else {
            return Err("File must have an extension".to_string());
        }

        // Check for path traversal in filename
        self.check_path_traversal(filename)?;

        Ok(())
    }

    /// Validate URL input
    pub fn validate_url(&self, url: &str) -> Result<(), String> {
        if url.is_empty() {
            return Err("URL cannot be empty".to_string());
        }

        if url.len() > 2048 {
            return Err("URL too long (max 2048 characters)".to_string());
        }

        // Basic URL format check
        if !url.starts_with("http://") && !url.starts_with("https://") {
            return Err("URL must start with http:// or https://".to_string());
        }

        // Security checks
        self.check_malicious_patterns(url, "URL")?;

        Ok(())
    }

    /// Check for malicious patterns
    fn check_malicious_patterns(&self, input: &str, field_name: &str) -> Result<(), String> {
        // Check for SQL injection patterns
        for pattern in &self.sql_injection_patterns {
            if pattern.is_match(input) {
                return Err(format!("{} contains potentially malicious content", field_name));
            }
        }

        // Check for XSS patterns
        for pattern in &self.xss_patterns {
            if pattern.is_match(input) {
                return Err(format!("{} contains potentially malicious script content", field_name));
            }
        }

        Ok(())
    }

    /// Check for path traversal attacks
    fn check_path_traversal(&self, input: &str) -> Result<(), String> {
        for pattern in &self.path_traversal_patterns {
            if pattern.is_match(input) {
                return Err("Input contains path traversal patterns".to_string());
            }
        }
        Ok(())
    }

    /// Sanitize text input
    pub fn sanitize_text(&self, input: &str) -> String {
        input
            .chars()
            .filter(|c| !c.is_control() || *c == '\t' || *c == '\n' || *c == '\r')
            .collect::<String>()
            .trim()
            .to_string()
    }

    /// Validate JSON input
    pub fn validate_json(&self, json_str: &str, max_size: Option<usize>) -> Result<(), String> {
        let max_size = max_size.unwrap_or(1024 * 1024); // 1MB default

        if json_str.len() > max_size {
            return Err(format!("JSON too large (max {} bytes)", max_size));
        }

        // Try to parse JSON to validate format
        serde_json::from_str::<serde_json::Value>(json_str)
            .map_err(|e| format!("Invalid JSON format: {}", e))?;

        // Security checks
        self.check_malicious_patterns(json_str, "JSON")?;

        Ok(())
    }

    /// Validate IP address
    pub fn validate_ip_address(&self, ip: &str) -> Result<(), String> {
        if ip.is_empty() {
            return Err("IP address cannot be empty".to_string());
        }

        // Try to parse as IPv4 or IPv6
        if ip.parse::<std::net::Ipv4Addr>().is_ok() || ip.parse::<std::net::Ipv6Addr>().is_ok() {
            Ok(())
        } else {
            Err("Invalid IP address format".to_string())
        }
    }

    /// Validate user agent string
    pub fn validate_user_agent(&self, user_agent: &str) -> Result<(), String> {
        if user_agent.len() > 512 {
            return Err("User agent string too long".to_string());
        }

        // Check for malicious patterns
        self.check_malicious_patterns(user_agent, "User agent")?;

        Ok(())
    }
}

/// Global validator instance
lazy_static::lazy_static! {
    pub static ref INPUT_VALIDATOR: InputValidator = {
        let config = if std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()) == "production" {
            ValidationConfig::production_config()
        } else {
            ValidationConfig::development_config()
        };
        InputValidator::new(config)
    };
}

/// Validation result type
pub type ValidationResult = Result<(), String>;

/// Convenience macros for validation
#[macro_export]
macro_rules! validate_email {
    ($email:expr) => {
        $crate::security::validation::INPUT_VALIDATOR.validate_email($email)
    };
}

#[macro_export]
macro_rules! validate_text {
    ($text:expr, $field:expr) => {
        $crate::security::validation::INPUT_VALIDATOR.validate_text($text, $field)
    };
}

#[macro_export]
macro_rules! validate_password {
    ($password:expr) => {
        $crate::security::validation::INPUT_VALIDATOR.validate_password_input($password)
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_validation() {
        let validator = InputValidator::new(ValidationConfig::default());

        assert!(validator.validate_email("test@example.com").is_ok());
        assert!(validator.validate_email("invalid-email").is_err());
        assert!(validator.validate_email("").is_err());
    }

    #[test]
    fn test_malicious_pattern_detection() {
        let validator = InputValidator::new(ValidationConfig::default());

        assert!(validator.validate_text("SELECT * FROM users", "input").is_err());
        assert!(validator.validate_text("<script>alert('xss')</script>", "input").is_err());
        assert!(validator.validate_text("normal text", "input").is_ok());
    }

    #[test]
    fn test_file_validation() {
        let validator = InputValidator::new(ValidationConfig::default());

        assert!(validator.validate_file_upload("test.jpg", 1000).is_ok());
        assert!(validator.validate_file_upload("test.exe", 1000).is_err());
        assert!(validator.validate_file_upload("../../../etc/passwd", 1000).is_err());
    }
}
