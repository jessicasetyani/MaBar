use serde::{Deserialize, Serialize};
use std::env;
use std::collections::HashMap;
// Removed encryption service for simplification
// use crate::security::encryption::EncryptionService;

/// Enterprise environment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentConfig {
    /// Environment name (development, staging, production)
    pub environment: String,
    /// Application configuration
    pub app: AppConfig,
    /// Database configuration
    pub database: DatabaseConfig,
    /// Security configuration
    pub security: SecurityConfig,
    /// Logging configuration
    pub logging: LoggingConfig,
    /// Monitoring configuration
    pub monitoring: MonitoringConfig,
    /// Feature flags
    pub features: FeatureFlags,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub name: String,
    pub version: String,
    pub host: String,
    pub port: u16,
    pub base_url: String,
    pub frontend_url: String,
    pub debug_mode: bool,
    pub maintenance_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub uri: String,
    pub name: String,
    pub pool_size: u32,
    pub timeout_seconds: u64,
    pub ssl_enabled: bool,
    pub backup_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub jwt_expiry: String,
    pub encryption_key: String,
    pub password_policy: PasswordPolicyConfig,
    pub session_config: SessionConfigData,
    pub rate_limiting: RateLimitingConfig,
    pub cors_origins: Vec<String>,
    pub csrf_protection: bool,
    pub security_headers: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordPolicyConfig {
    pub min_length: usize,
    pub require_uppercase: bool,
    pub require_lowercase: bool,
    pub require_numbers: bool,
    pub require_special: bool,
    pub min_strength_score: u8,
    pub history_length: usize,
    pub max_age_days: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfigData {
    pub timeout_minutes: i64,
    pub max_concurrent: usize,
    pub secure_cookies: bool,
    pub same_site: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitingConfig {
    pub enabled: bool,
    pub requests_per_minute: u32,
    pub burst_size: u32,
    pub whitelist_ips: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
    pub file_enabled: bool,
    pub file_path: String,
    pub rotation_size: String,
    pub retention_days: u32,
    pub structured_logging: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub metrics_enabled: bool,
    pub health_check_enabled: bool,
    pub performance_monitoring: bool,
    pub error_tracking: bool,
    pub audit_logging: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureFlags {
    pub oauth_enabled: bool,
    pub mfa_enabled: bool,
    pub email_verification: bool,
    pub password_reset: bool,
    pub user_registration: bool,
    pub admin_panel: bool,
    pub api_versioning: bool,
}

impl EnvironmentConfig {
    /// Load configuration from environment variables
    pub fn from_environment() -> Result<Self, String> {
        let environment = env::var("ENVIRONMENT")
            .unwrap_or_else(|_| "development".to_string());

        match environment.as_str() {
            "production" => Self::production_config(),
            "staging" => Self::staging_config(),
            "development" => Self::development_config(),
            _ => Err(format!("Unknown environment: {}", environment)),
        }
    }

    /// Production configuration with enterprise security
    pub fn production_config() -> Result<Self, String> {
        Ok(Self {
            environment: "production".to_string(),
            app: AppConfig {
                name: "MaBar".to_string(),
                version: env::var("APP_VERSION").unwrap_or_else(|_| "1.0.0".to_string()),
                host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
                port: env::var("BACKEND_PORT")
                    .or_else(|_| env::var("PORT"))
                    .unwrap_or_else(|_| "5000".to_string())
                    .parse()
                    .map_err(|_| "Invalid PORT value")?,
                base_url: {
                    let base = env::var("BACKEND_BASE_URL")
                        .map_err(|_| "BACKEND_BASE_URL required in production")?;
                    let port = env::var("BACKEND_PORT")
                        .or_else(|_| env::var("PORT"))
                        .unwrap_or_else(|_| "5000".to_string());
                    format!("{}:{}", base, port)
                },
                frontend_url: {
                    let base = env::var("FRONTEND_BASE_URL")
                        .map_err(|_| "FRONTEND_BASE_URL required in production")?;
                    let port = env::var("FRONTEND_PORT")
                        .unwrap_or_else(|_| "5173".to_string());
                    format!("{}:{}", base, port)
                },
                debug_mode: false,
                maintenance_mode: env::var("MAINTENANCE_MODE")
                    .unwrap_or_else(|_| "false".to_string())
                    .parse()
                    .unwrap_or(false),
            },
            database: DatabaseConfig {
                uri: env::var("MONGODB_URI")
                    .map_err(|_| "MONGODB_URI required in production")?,
                name: env::var("DB_NAME").unwrap_or_else(|_| "mabar_production".to_string()),
                pool_size: 20,
                timeout_seconds: 30,
                ssl_enabled: true,
                backup_enabled: true,
            },
            security: SecurityConfig {
                jwt_secret: env::var("JWT_SECRET")
                    .map_err(|_| "JWT_SECRET required in production")?,
                jwt_expiry: env::var("JWT_EXPIRE").unwrap_or_else(|_| "7d".to_string()),
                encryption_key: env::var("ENCRYPTION_MASTER_KEY")
                    .map_err(|_| "ENCRYPTION_MASTER_KEY required in production")?,
                password_policy: PasswordPolicyConfig {
                    min_length: 12,
                    require_uppercase: true,
                    require_lowercase: true,
                    require_numbers: true,
                    require_special: true,
                    min_strength_score: 3,
                    history_length: 12,
                    max_age_days: 90,
                },
                session_config: SessionConfigData {
                    timeout_minutes: 480, // 8 hours
                    max_concurrent: 3,
                    secure_cookies: true,
                    same_site: "Strict".to_string(),
                },
                rate_limiting: RateLimitingConfig {
                    enabled: true,
                    requests_per_minute: 60,
                    burst_size: 10,
                    whitelist_ips: vec![],
                },
                cors_origins: env::var("CORS_ORIGINS")
                    .unwrap_or_default()
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect(),
                csrf_protection: true,
                security_headers: true,
            },
            logging: LoggingConfig {
                level: env::var("LOG_LEVEL").unwrap_or_else(|_| "warn".to_string()),
                format: "json".to_string(),
                file_enabled: true,
                file_path: env::var("LOG_FILE").unwrap_or_else(|_| "/var/log/mabar/app.log".to_string()),
                rotation_size: "100MB".to_string(),
                retention_days: 30,
                structured_logging: true,
            },
            monitoring: MonitoringConfig {
                metrics_enabled: true,
                health_check_enabled: true,
                performance_monitoring: true,
                error_tracking: true,
                audit_logging: true,
            },
            features: FeatureFlags {
                oauth_enabled: true,
                mfa_enabled: true,
                email_verification: true,
                password_reset: true,
                user_registration: true,
                admin_panel: true,
                api_versioning: true,
            },
        })
    }

    /// Staging configuration (production-like with relaxed constraints)
    pub fn staging_config() -> Result<Self, String> {
        let mut config = Self::production_config()?;
        config.environment = "staging".to_string();
        
        // Relaxed constraints for staging
        config.app.debug_mode = true;
        config.security.password_policy.min_length = 8;
        config.security.password_policy.min_strength_score = 2;
        config.security.session_config.timeout_minutes = 1440; // 24 hours
        config.logging.level = "info".to_string();
        config.monitoring.performance_monitoring = false;
        
        Ok(config)
    }

    /// Development configuration
    pub fn development_config() -> Result<Self, String> {
        Ok(Self {
            environment: "development".to_string(),
            app: AppConfig {
                name: "MaBar-Dev".to_string(),
                version: "dev".to_string(),
                host: env::var("BACKEND_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
                port: env::var("BACKEND_PORT")
                    .or_else(|_| env::var("PORT"))
                    .unwrap_or_else(|_| "5000".to_string())
                    .parse()
                    .unwrap_or(5000),
                base_url: {
                    let base = env::var("BACKEND_BASE_URL")
                        .unwrap_or_else(|_| "http://localhost".to_string());
                    let port = env::var("BACKEND_PORT")
                        .or_else(|_| env::var("PORT"))
                        .unwrap_or_else(|_| "5000".to_string());
                    format!("{}:{}", base, port)
                },
                frontend_url: {
                    let base = env::var("FRONTEND_BASE_URL")
                        .unwrap_or_else(|_| "http://localhost".to_string());
                    let port = env::var("FRONTEND_PORT")
                        .unwrap_or_else(|_| "5173".to_string());
                    format!("{}:{}", base, port)
                },
                debug_mode: true,
                maintenance_mode: false,
            },
            database: DatabaseConfig {
                uri: env::var("MONGODB_URI")
                    .unwrap_or_else(|_| "mongodb://localhost:27017/mabar_dev".to_string()),
                name: "mabar_dev".to_string(),
                pool_size: 5,
                timeout_seconds: 10,
                ssl_enabled: false,
                backup_enabled: false,
            },
            security: SecurityConfig {
                jwt_secret: env::var("JWT_SECRET")
                    .unwrap_or_else(|_| "dev_jwt_secret_change_in_production".to_string()),
                jwt_expiry: "7d".to_string(),
                encryption_key: env::var("ENCRYPTION_MASTER_KEY")
                    .unwrap_or_else(|_| "dev_encryption_key_change_in_production".to_string()),
                password_policy: PasswordPolicyConfig {
                    min_length: 8,
                    require_uppercase: true,
                    require_lowercase: true,
                    require_numbers: true,
                    require_special: true,
                    min_strength_score: 1,
                    history_length: 0,
                    max_age_days: 365,
                },
                session_config: SessionConfigData {
                    timeout_minutes: 1440, // 24 hours for development
                    max_concurrent: 5,
                    secure_cookies: false,
                    same_site: "Lax".to_string(),
                },
                rate_limiting: RateLimitingConfig {
                    enabled: false, // Disabled for development
                    requests_per_minute: 1000,
                    burst_size: 100,
                    whitelist_ips: vec!["127.0.0.1".to_string()],
                },
                cors_origins: {
                    let base = env::var("FRONTEND_BASE_URL")
                        .unwrap_or_else(|_| "http://localhost".to_string());
                    let port = env::var("FRONTEND_PORT")
                        .unwrap_or_else(|_| "5173".to_string());
                    vec![format!("{}:{}", base, port)]
                },
                csrf_protection: false, // Simplified for development
                security_headers: true,
            },
            logging: LoggingConfig {
                level: "debug".to_string(),
                format: "pretty".to_string(),
                file_enabled: true,
                file_path: "./logs/app.log".to_string(),
                rotation_size: "10MB".to_string(),
                retention_days: 7,
                structured_logging: false,
            },
            monitoring: MonitoringConfig {
                metrics_enabled: true,
                health_check_enabled: true,
                performance_monitoring: false,
                error_tracking: true,
                audit_logging: true,
            },
            features: FeatureFlags {
                oauth_enabled: true,
                mfa_enabled: false, // Disabled for development convenience
                email_verification: false,
                password_reset: true,
                user_registration: true,
                admin_panel: true,
                api_versioning: false,
            },
        })
    }

    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        // Validate required fields based on environment
        match self.environment.as_str() {
            "production" => {
                if self.security.jwt_secret.len() < 32 {
                    return Err("JWT secret must be at least 32 characters in production".to_string());
                }
                if self.security.encryption_key.len() < 32 {
                    return Err("Encryption key must be at least 32 characters in production".to_string());
                }
                if !self.database.ssl_enabled {
                    return Err("SSL must be enabled for database in production".to_string());
                }
                if !self.security.csrf_protection {
                    return Err("CSRF protection must be enabled in production".to_string());
                }
            }
            "staging" => {
                if self.security.jwt_secret.len() < 16 {
                    return Err("JWT secret must be at least 16 characters in staging".to_string());
                }
            }
            _ => {} // Development has relaxed validation
        }

        Ok(())
    }

    /// Get admin credentials configuration
    pub fn get_admin_credentials(&self) -> Result<AdminCredentialsConfig, String> {
        AdminCredentialsConfig::from_environment(&self.environment)
    }
}

/// Admin credentials configuration
#[derive(Debug, Clone)]
pub struct AdminCredentialsConfig {
    pub email: String,
    pub password: String,
    pub encrypted: bool,
    pub rotation_required: bool,
}

impl AdminCredentialsConfig {
    /// Load admin credentials from environment (simplified for local development)
    pub fn from_environment(environment: &str) -> Result<Self, String> {
        match environment {
            "production" => {
                // For production, use environment variables directly
                let email = env::var("ADMIN_EMAIL")
                    .map_err(|_| "ADMIN_EMAIL required in production")?;
                let password = env::var("ADMIN_PASSWORD")
                    .map_err(|_| "ADMIN_PASSWORD required in production")?;

                Ok(Self {
                    email,
                    password,
                    encrypted: false,
                    rotation_required: false,
                })
            }
            _ => {
                // Development/staging can use environment variables
                let email = env::var("ADMIN_EMAIL")
                    .unwrap_or_else(|_| "admin@mabar.local".to_string());
                let password = env::var("ADMIN_PASSWORD")
                    .unwrap_or_else(|_| "DevAdmin123!".to_string());

                Ok(Self {
                    email,
                    password,
                    encrypted: false,
                    rotation_required: false,
                })
            }
        }
    }
}

/// Global configuration instance
lazy_static::lazy_static! {
    pub static ref CONFIG: EnvironmentConfig = {
        EnvironmentConfig::from_environment()
            .expect("Failed to load environment configuration")
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_development_config() {
        let config = EnvironmentConfig::development_config().unwrap();
        assert_eq!(config.environment, "development");
        assert!(config.app.debug_mode);
        assert!(!config.security.csrf_protection);
    }

    #[test]
    fn test_config_validation() {
        let config = EnvironmentConfig::development_config().unwrap();
        assert!(config.validate().is_ok());
    }
}
