use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{rand_core::OsRng, SaltString, Error as PasswordHashError}
};
use serde::{Deserialize, Serialize};
use std::env;
use regex::Regex;
use zxcvbn::zxcvbn;

/// Enterprise-grade password security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordConfig {
    /// Argon2 memory cost (KB) - Production: 65536 (64MB), Development: 4096 (4MB)
    pub memory_cost: u32,
    /// Argon2 time cost (iterations) - Production: 3, Development: 2
    pub time_cost: u32,
    /// Argon2 parallelism - Production: 4, Development: 2
    pub parallelism: u32,
    /// Minimum password length
    pub min_length: usize,
    /// Maximum password length
    pub max_length: usize,
    /// Require uppercase letters
    pub require_uppercase: bool,
    /// Require lowercase letters
    pub require_lowercase: bool,
    /// Require numbers
    pub require_numbers: bool,
    /// Require special characters
    pub require_special: bool,
    /// Minimum password strength score (0-4)
    pub min_strength_score: u8,
    /// Password history length (prevent reuse)
    pub history_length: usize,
}

impl Default for PasswordConfig {
    fn default() -> Self {
        Self::production_config()
    }
}

impl PasswordConfig {
    /// Production-grade configuration for enterprise environments
    pub fn production_config() -> Self {
        Self {
            memory_cost: 65536,  // 64MB - Enterprise standard
            time_cost: 3,        // 3 iterations - Balanced security/performance
            parallelism: 4,      // 4 threads - Modern server standard
            min_length: 12,      // Enterprise minimum
            max_length: 128,     // Reasonable maximum
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special: true,
            min_strength_score: 3, // Strong passwords only
            history_length: 12,   // Prevent reuse of last 12 passwords
        }
    }

    /// Simplified development configuration for local portfolio projects
    pub fn development_config() -> Self {
        Self {
            memory_cost: 4096,   // 4MB - Reduced for development
            time_cost: 2,        // 2 iterations - Faster for testing
            parallelism: 2,      // 2 threads - Development machines
            min_length: 8,       // Simple but secure
            max_length: 128,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special: true,
            min_strength_score: 1, // Relaxed for local development
            history_length: 0,    // No history tracking for simplicity
        }
    }

    /// Load configuration from environment with fallbacks
    pub fn from_environment() -> Self {
        let is_production = env::var("ENVIRONMENT")
            .unwrap_or_else(|_| "development".to_string())
            .to_lowercase() == "production";

        if is_production {
            Self::production_config()
        } else {
            Self::development_config()
        }
    }
}

/// Enterprise password security manager
pub struct PasswordSecurity {
    config: PasswordConfig,
    argon2: Argon2<'static>,
}

impl PasswordSecurity {
    /// Create new password security instance with enterprise configuration
    pub fn new() -> Self {
        let config = PasswordConfig::from_environment();
        let argon2 = Argon2::new(
            argon2::Algorithm::Argon2id,
            argon2::Version::V0x13,
            argon2::Params::new(
                config.memory_cost,
                config.time_cost,
                config.parallelism,
                None
            ).expect("Invalid Argon2 parameters")
        );

        Self { config, argon2 }
    }

    /// Generate enterprise-grade secure password hash
    pub fn hash_password(&self, password: &str) -> Result<String, PasswordHashError> {
        // Validate password before hashing
        self.validate_password_strength(password)
            .map_err(|e| PasswordHashError::Password)?;

        let salt = SaltString::generate(&mut OsRng);
        let password_hash = self.argon2.hash_password(password.as_bytes(), &salt)?;
        Ok(password_hash.to_string())
    }

    /// Verify password against hash with timing attack protection
    pub fn verify_password(&self, password: &str, hash: &str) -> Result<bool, PasswordHashError> {
        let parsed_hash = PasswordHash::new(hash)?;
        match self.argon2.verify_password(password.as_bytes(), &parsed_hash) {
            Ok(()) => Ok(true),
            Err(PasswordHashError::Password) => Ok(false),
            Err(e) => Err(e),
        }
    }

    /// Validate password strength using enterprise criteria
    pub fn validate_password_strength(&self, password: &str) -> Result<(), String> {
        // Length validation
        if password.len() < self.config.min_length {
            return Err(format!("Password must be at least {} characters long", self.config.min_length));
        }
        if password.len() > self.config.max_length {
            return Err(format!("Password must be no more than {} characters long", self.config.max_length));
        }

        // Character class validation
        if self.config.require_uppercase && !password.chars().any(|c| c.is_uppercase()) {
            return Err("Password must contain at least one uppercase letter".to_string());
        }
        if self.config.require_lowercase && !password.chars().any(|c| c.is_lowercase()) {
            return Err("Password must contain at least one lowercase letter".to_string());
        }
        if self.config.require_numbers && !password.chars().any(|c| c.is_numeric()) {
            return Err("Password must contain at least one number".to_string());
        }
        if self.config.require_special {
            let has_special = password.chars().any(|c| "!@#$%^&*()_+-=[]{}|;':\",./<>?".contains(c));
            if !has_special {
                return Err("Password must contain at least one special character".to_string());
            }
        }

        // Simplified strength validation for local development
        if self.config.min_strength_score > 1 {
            let strength = zxcvbn(password, &[]).unwrap();
            if strength.score() < self.config.min_strength_score {
                return Err(format!(
                    "Password strength insufficient. Score: {}/4, Required: {}/4",
                    strength.score(),
                    self.config.min_strength_score
                ));
            }
        }

        Ok(())
    }

    /// Simplified check for common password patterns (for local development)
    fn is_common_pattern(&self, password: &str) -> bool {
        let lower_password = password.to_lowercase();

        // Simple checks for common patterns
        if lower_password == "password" || lower_password == "123456" || lower_password == "qwerty" {
            return true;
        }

        false
    }

    /// Generate secure random password meeting enterprise criteria
    pub fn generate_secure_password(&self, length: Option<usize>) -> String {
        use rand::Rng;
        
        let length = length.unwrap_or(self.config.min_length.max(16));
        let mut rng = rand::thread_rng();
        
        let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let lowercase = "abcdefghijklmnopqrstuvwxyz";
        let numbers = "0123456789";
        let special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        let mut password = String::new();
        
        // Ensure at least one character from each required class
        if self.config.require_uppercase {
            password.push(uppercase.chars().nth(rng.gen_range(0..uppercase.len())).unwrap());
        }
        if self.config.require_lowercase {
            password.push(lowercase.chars().nth(rng.gen_range(0..lowercase.len())).unwrap());
        }
        if self.config.require_numbers {
            password.push(numbers.chars().nth(rng.gen_range(0..numbers.len())).unwrap());
        }
        if self.config.require_special {
            password.push(special.chars().nth(rng.gen_range(0..special.len())).unwrap());
        }
        
        // Fill remaining length with random characters
        let all_chars = format!("{}{}{}{}", uppercase, lowercase, numbers, special);
        while password.len() < length {
            password.push(all_chars.chars().nth(rng.gen_range(0..all_chars.len())).unwrap());
        }
        
        // Shuffle the password
        let mut chars: Vec<char> = password.chars().collect();
        for i in (1..chars.len()).rev() {
            let j = rng.gen_range(0..=i);
            chars.swap(i, j);
        }
        
        chars.into_iter().collect()
    }

    /// Get password configuration for client-side validation
    pub fn get_config(&self) -> &PasswordConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_validation() {
        let security = PasswordSecurity::new();
        
        // Test weak password
        assert!(security.validate_password_strength("weak").is_err());
        
        // Test strong password
        assert!(security.validate_password_strength("StrongP@ssw0rd123!").is_ok());
    }

    #[test]
    fn test_password_hashing() {
        let security = PasswordSecurity::new();
        let password = "TestP@ssw0rd123!";

        let hash = security.hash_password(password).unwrap();
        assert!(security.verify_password(password, &hash).unwrap());
        let wrong_password = "wrong";
        assert!(!security.verify_password(wrong_password, &hash).unwrap());
    }

    #[test]
    fn test_password_generation() {
        let security = PasswordSecurity::new();
        let password = security.generate_secure_password(Some(16));
        
        assert_eq!(password.len(), 16);
        assert!(security.validate_password_strength(&password).is_ok());
    }
}
