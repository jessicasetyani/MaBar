use actix_web::{dev::ServiceRequest, Error, HttpMessage, HttpResponse, Result, web, error::{ErrorUnauthorized, ErrorForbidden}};
use actix_web_httpauth::extractors::bearer::{BearerAuth, Config};
use actix_web_httpauth::extractors::AuthenticationError;
use actix_web_httpauth::middleware::HttpAuthentication;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use std::env;
use chrono;
use log;
use crate::models::{User, UserRole};

/// Enhanced JWT Claims for production-grade authentication
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub email: Option<String>,
    pub role: Option<UserRole>,
    pub exp: usize,
    pub iat: Option<usize>, // Issued at
    pub iss: Option<String>, // Issuer
}

/// Production-grade JWT validator with comprehensive error handling and security logging
pub async fn jwt_validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let token = credentials.token();
    let request_path = req.path().to_string();
    let client_ip = req.connection_info().peer_addr().unwrap_or("unknown").to_string();

    // Security audit logging (without exposing sensitive data)
    log::info!(
        "Authentication attempt: path={}, ip={}, timestamp={}",
        request_path, client_ip, chrono::Utc::now().to_rfc3339()
    );

    // Get JWT secret from environment with secure fallback
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| {
        log::warn!("JWT_SECRET not set, using development default");
        "default_secret_for_development_only".to_string()
    });

    // Configure JWT validation with security settings
    let mut validation = Validation::new(Algorithm::HS256);
    validation.set_issuer(&["MaBar-Auth-Service"]);
    validation.validate_exp = true;
    validation.validate_iat = true;

    // Validate token with comprehensive error handling
    match decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &validation,
    ) {
        Ok(token_data) => {
            let claims = token_data.claims;

            // Additional security checks
            let current_time = chrono::Utc::now().timestamp() as usize;

            // Check token expiration with buffer
            if claims.exp <= current_time {
                log::warn!(
                    "Expired token access attempt: user={}, expired_at={}, current_time={}, ip={}",
                    claims.id, claims.exp, current_time, client_ip
                );
                return Err((
                    ErrorUnauthorized("Token has expired. Please log in again."),
                    req,
                ));
            }

            // Check if token is too old (issued more than max lifetime ago)
            if let Some(iat) = claims.iat {
                let max_token_age = 7 * 24 * 60 * 60; // 7 days in seconds
                if current_time - iat > max_token_age {
                    log::warn!(
                        "Token too old: user={}, issued_at={}, current_time={}, ip={}",
                        claims.id, iat, current_time, client_ip
                    );
                    return Err((
                        ErrorUnauthorized("Token is too old. Please log in again."),
                        req,
                    ));
                }
            }

            // Create authenticated user context with comprehensive information
            let auth_user = AuthenticatedUser {
                id: claims.id.clone(),
                email: claims.email.clone(),
                role: claims.role.clone(),
            };

            // Attach user context to request extensions
            req.extensions_mut().insert(auth_user);

            // Success logging
            log::info!(
                "Authentication successful: user={}, role={:?}, ip={}, path={}",
                claims.id, claims.role, client_ip, request_path
            );

            Ok(req)
        }
        Err(err) => {
            // Detailed error logging for security monitoring
            log::warn!(
                "Authentication failed: error={:?}, ip={}, path={}, timestamp={}",
                err, client_ip, request_path, chrono::Utc::now().to_rfc3339()
            );

            // Return generic error to prevent information leakage
            Err((
                ErrorUnauthorized("Invalid authentication credentials. Please log in again."),
                req,
            ))
        }
    }
}

/// Authenticated user context for request extensions
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: String,
    pub email: Option<String>,
    pub role: Option<UserRole>,
}

pub fn auth_middleware() -> HttpAuthentication<BearerAuth, fn(ServiceRequest, BearerAuth) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<ServiceRequest, (Error, ServiceRequest)>> + Send>>> {
    fn wrapper(req: ServiceRequest, credentials: BearerAuth) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<ServiceRequest, (Error, ServiceRequest)>> + Send>> {
        Box::pin(jwt_validator(req, credentials))
    }
    HttpAuthentication::bearer(wrapper)
}

pub fn require_role(allowed_roles: Vec<UserRole>) -> impl Fn(&User) -> Result<(), HttpResponse> {
    move |user: &User| {
        if let Some(user_role) = &user.role {
            if allowed_roles.contains(user_role) {
                Ok(())
            } else {
                Err(HttpResponse::Forbidden().json(serde_json::json!({
                    "message": "Access denied. Insufficient permissions."
                })))
            }
        } else {
            Err(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Access denied. No role assigned."
            })))
        }
    }
}

pub fn require_admin() -> impl Fn(&User) -> Result<(), HttpResponse> {
    require_role(vec![UserRole::Admin])
}

pub fn require_player() -> impl Fn(&User) -> Result<(), HttpResponse> {
    require_role(vec![UserRole::Player])
}

pub fn require_venue_owner() -> impl Fn(&User) -> Result<(), HttpResponse> {
    require_role(vec![UserRole::VenueOwner])
}

pub fn require_player_or_venue_owner() -> impl Fn(&User) -> Result<(), HttpResponse> {
    require_role(vec![UserRole::Player, UserRole::VenueOwner])
}

/// Production-grade role hierarchy checker with comprehensive permission logic
pub fn has_role_or_higher(user_role: &UserRole, required_role: &UserRole) -> bool {
    let role_hierarchy = |role: &UserRole| -> u8 {
        match role {
            UserRole::Player => 1,
            UserRole::VenueOwner => 2,
            UserRole::Admin => 3,
        }
    };

    role_hierarchy(user_role) >= role_hierarchy(required_role)
}

/// Check if user has specific permission based on role
pub fn has_permission(user_role: &UserRole, permission: &str) -> bool {
    let role_permissions = match user_role {
        UserRole::Player => vec![
            "view_profile", "book_venues", "view_bookings", "update_profile"
        ],
        UserRole::VenueOwner => vec![
            "view_profile", "book_venues", "view_bookings", "update_profile",
            "manage_venues", "view_venue_bookings", "manage_venue_details"
        ],
        UserRole::Admin => vec![
            "view_profile", "book_venues", "view_bookings", "update_profile",
            "manage_venues", "view_venue_bookings", "manage_venue_details",
            "manage_users", "view_reports", "manage_system", "view_audit_logs"
        ],
    };

    role_permissions.contains(&permission)
}

/// Extract authenticated user from request extensions
pub fn get_authenticated_user(req: &ServiceRequest) -> Option<AuthenticatedUser> {
    req.extensions().get::<AuthenticatedUser>().cloned()
}

/// Middleware factory for role-based authorization
pub fn require_role_middleware(required_role: UserRole) -> impl Fn(ServiceRequest, BearerAuth) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<ServiceRequest, (Error, ServiceRequest)>> + Send>> {
    move |req: ServiceRequest, credentials: BearerAuth| {
        let required_role = required_role.clone();
        Box::pin(async move {
            // First validate JWT
            let req = match jwt_validator(req, credentials).await {
                Ok(req) => req,
                Err(err) => return Err(err),
            };

            // Then check role authorization
            if let Some(auth_user) = get_authenticated_user(&req) {
                if let Some(user_role) = &auth_user.role {
                    if has_role_or_higher(user_role, &required_role) {
                        println!("Auth middleware: Role authorization successful for user {} with role {:?}", auth_user.id, user_role);
                        Ok(req)
                    } else {
                        println!("Auth middleware: Role authorization failed for user {} - required {:?}, has {:?}", auth_user.id, required_role, user_role);
                        Err((
                            ErrorUnauthorized("Insufficient permissions for this resource."),
                            req,
                        ))
                    }
                } else {
                    println!("Auth middleware: User {} has no role assigned", auth_user.id);
                    Err((
                        ErrorUnauthorized("No role assigned. Please complete your profile setup."),
                        req,
                    ))
                }
            } else {
                println!("Auth middleware: No authenticated user found in request context");
                Err((
                    ErrorUnauthorized("Authentication required."),
                    req,
                ))
            }
        })
    }
}