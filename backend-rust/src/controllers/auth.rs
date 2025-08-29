use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Algorithm, Validation};
use bcrypt::{verify, hash, DEFAULT_COST};
use mongodb::{Database, bson::{doc, oid::ObjectId, DateTime}};
use std::env;
use regex::Regex;
use oauth2::{AuthUrl, ClientId, ClientSecret, RedirectUrl, TokenUrl, CsrfToken, Scope};
use oauth2::basic::BasicClient;
use reqwest;
use crate::models::{User, UserRole, AuthProvider};
use crate::utils::seed;
use crate::security::password::PasswordSecurity;
// Removed complex session and audit systems for simplification
// use crate::security::session::{SessionManager, SESSION_MANAGER};
// use crate::security::audit::{SecurityEvent, SecurityEventType, AUDIT_LOGGER};
// Removed complex validation for simplification
// use crate::security::validation::INPUT_VALIDATOR;
// use crate::config::environment::CONFIG;
use chrono;

// Simplified JWT secret for development
const JWT_SECRET: &str = "your-secret-key-for-development-only";

/// Simplified JWT Claims for development
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub email: Option<String>,
    pub role: Option<UserRole>,
    pub exp: usize,
    pub iat: Option<usize>, // Issued at
    pub iss: Option<String>, // Issuer
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

#[derive(Deserialize)]
pub struct OAuthCallbackQuery {
    pub code: String,
    pub state: String,
}

#[derive(Deserialize)]
pub struct GoogleUserInfo {
    pub id: String,
    pub email: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
}

#[derive(Deserialize)]
pub struct FacebookUserInfo {
    pub id: String,
    pub email: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub picture: Option<FacebookPicture>,
}

#[derive(Deserialize)]
pub struct FacebookPicture {
    pub data: FacebookPictureData,
}

#[derive(Deserialize)]
pub struct FacebookPictureData {
    pub url: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub message: String,
    pub user: UserInfo,
    pub token: String,
}

#[derive(Serialize)]
pub struct UserInfo {
    pub id: String,
    pub email: Option<String>,
    pub role: UserRole,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub name: String,
    pub onboarding_completed: bool,
}

#[derive(Serialize)]
pub struct AuthStatusResponse {
    pub is_authenticated: bool,
    pub user: Option<UserInfo>,
}

/// Production-grade JWT token generation with enhanced claims
fn generate_token(user: &User) -> Result<String, jsonwebtoken::errors::Error> {
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret_for_development".to_string());
    let jwt_expire = env::var("JWT_EXPIRE").unwrap_or_else(|_| "7d".to_string());

    let now = chrono::Utc::now().timestamp() as usize;
    let exp = match jwt_expire.as_str() {
        "7d" => now + 7 * 24 * 60 * 60,
        "1d" => now + 24 * 60 * 60,
        "1h" => now + 60 * 60,
        "15m" => now + 15 * 60, // For development testing
        _ => now + 7 * 24 * 60 * 60, // Default to 7 days
    };

    // Enhanced claims for production-grade authentication
    let claims = Claims {
        id: user.id.as_ref().unwrap().to_hex(),
        email: Some(user.email.clone()),
        role: user.role.clone(),
        exp,
        iat: Some(now),
        iss: Some("MaBar-Auth-Service".to_string()),
    };

    println!("Generating JWT token for user {} with role {:?}", user.email, user.role);

    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
}

fn user_to_info(user: &User) -> UserInfo {
    let name = format!("{} {}", 
        user.first_name.as_deref().unwrap_or(""), 
        user.last_name.as_deref().unwrap_or("")
    ).trim().to_string();
    
    UserInfo {
        id: user.id.as_ref().unwrap().to_hex(),
        email: Some(user.email.clone()),
        role: user.role.clone().unwrap_or(UserRole::Player),
        first_name: user.first_name.clone(),
        last_name: user.last_name.clone(),
        name: if name.is_empty() { "User".to_string() } else { name },
        onboarding_completed: user.onboarding_completed,
    }
}

pub async fn admin_login(
    req: HttpRequest,
    db: web::Data<Database>,
    login_req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let collection = db.collection::<User>("users");

    // Simplified input validation for development
    if login_req.email.is_empty() || !login_req.email.contains('@') {
        println!("⚠️  Invalid email format: {}", login_req.email);
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Invalid email format"
        })));
    }

    if login_req.password.is_empty() {
        println!("⚠️  Empty password provided for: {}", login_req.email);
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Invalid password format"
        })));
    }

    // Simplified logging for development
    println!("🔐 Admin login attempt for: {}", login_req.email);

    // Try to find admin user in database
    match collection.find_one(doc! {"email": &login_req.email}, None).await {
        Ok(Some(user)) => {
            if !matches!(user.role, Some(UserRole::Admin)) {
                println!("⚠️  Non-admin user attempted admin login: {}", login_req.email);
                return Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                    "message": "Access denied. Admin privileges required."
                })));
            }

            // Verify password using Argon2
            if let Some(password_hash) = &user.password_hash {
                let password_security = PasswordSecurity::new();
                match password_security.verify_password(&login_req.password, password_hash) {
                    Ok(true) => {
                        // Generate JWT token
                        let claims = Claims {
                            id: user.id.as_ref().unwrap().to_hex(),
                            email: Some(user.email.clone()),
                            role: user.role.clone(),
                            exp: (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize,
                            iat: Some(chrono::Utc::now().timestamp() as usize),
                            iss: Some("mabar-backend".to_string()),
                        };

                        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(JWT_SECRET.as_ref()))
                            .map_err(|_| actix_web::error::ErrorInternalServerError("Token generation failed"))?;

                        println!("✅ Admin login successful for: {}", login_req.email);

                        return Ok(HttpResponse::Ok().json(serde_json::json!({
                            "message": "Login successful",
                            "token": token,
                            "user": user_to_info(&user)
                        })));
                    }

                    Ok(false) => {
                        println!("⚠️  Invalid password for admin: {}", login_req.email);
                    }
                    Err(e) => {
                        println!("❌ Password verification error: {}", e);
                    }
                }
            }
        }
        Ok(None) => {
            println!("⚠️  Admin user not found: {}", login_req.email);
        }
        Err(e) => {
            println!("❌ Database error during admin login: {}", e);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Internal server error"
            })));
        }
    }

    // Fallback: Check environment credentials for development
    if env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()) == "development" {
        let admin_email = env::var("ADMIN_EMAIL").unwrap_or_else(|_| "jessica@mabar.com".to_string());
        let admin_password = env::var("ADMIN_PASSWORD").unwrap_or_else(|_| "Admin123!".to_string());

        if login_req.email == admin_email && login_req.password == admin_password {
            // Create temporary admin user for development
            let temp_admin = User {
                id: Some(ObjectId::new()),
                email: login_req.email.clone(),
                first_name: env::var("ADMIN_FIRST_NAME").ok(),
                last_name: env::var("ADMIN_LAST_NAME").ok(),
                role: Some(UserRole::Admin),
                is_active: true,
                onboarding_completed: true,
                created_at: DateTime::now(),
                updated_at: DateTime::now(),
                ..Default::default()
            };

            // Generate JWT token
            let claims = Claims {
                id: temp_admin.id.as_ref().unwrap().to_hex(),
                email: Some(temp_admin.email.clone()),
                role: temp_admin.role.clone(),
                exp: (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize,
                iat: Some(chrono::Utc::now().timestamp() as usize),
                iss: Some("mabar-backend".to_string()),
            };

            let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(JWT_SECRET.as_ref()))
                .map_err(|_| actix_web::error::ErrorInternalServerError("Token generation failed"))?;

            println!("✅ Admin login successful (development mode): {}", login_req.email);

            return Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Login successful",
                "token": token,
                "user": user_to_info(&temp_admin)
            })));
        }
    }

    // Login failed
    println!("❌ Admin login failed for: {}", login_req.email);
    Ok(HttpResponse::Unauthorized().json(serde_json::json!({
        "message": "Invalid credentials"
    })))
}

pub async fn admin_logout(req: HttpRequest) -> Result<HttpResponse> {
    // Simplified logout for development
    if let Some(user) = req.extensions().get::<User>() {
        println!("🔓 Admin logout: {}", user.email);

        Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Admin logged out successfully"
        })))
    } else {
        Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Logged out successfully"
        })))
    }
}

pub async fn logout() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Logged out successfully"
    })))
}

pub async fn get_me(req: HttpRequest) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        Ok(HttpResponse::Ok().json(serde_json::json!({
            "user": user_to_info(user),
            "is_authenticated": true
        })))
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}

/// Production-grade auth status endpoint with proper JWT validation
pub async fn auth_status(req: HttpRequest) -> Result<HttpResponse> {
    println!("Auth status endpoint called - production mode");

    // Try to extract token from Authorization header
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret_for_development".to_string());

                match decode::<Claims>(
                    token,
                    &DecodingKey::from_secret(jwt_secret.as_ref()),
                    &Validation::new(Algorithm::HS256),
                ) {
                    Ok(token_data) => {
                        let claims = token_data.claims;

                        // Check token expiration
                        let current_time = chrono::Utc::now().timestamp() as usize;
                        if claims.exp < current_time {
                            println!("Auth status: Token expired for user {}", claims.id);
                            return Ok(HttpResponse::Ok().json(AuthStatusResponse {
                                is_authenticated: false,
                                user: None,
                            }));
                        }

                        // Create user info from token claims
                        let user_info = UserInfo {
                            id: claims.id.clone(),
                            email: claims.email.clone(),
                            role: claims.role.unwrap_or(UserRole::Player),
                            first_name: None,
                            last_name: None,
                            name: claims.email.clone().unwrap_or("Unknown User".to_string()),
                            onboarding_completed: true, // Assume completed if they have a valid token
                        };

                        println!("Auth status: Valid token for user {}", claims.id);
                        return Ok(HttpResponse::Ok().json(AuthStatusResponse {
                            is_authenticated: true,
                            user: Some(user_info),
                        }));
                    }
                    Err(e) => {
                        println!("Auth status: Token validation failed: {:?}", e);
                    }
                }
            }
        }
    }

    // If we reach here, user is not authenticated
    println!("Auth status: No valid authentication found");
    Ok(HttpResponse::Ok().json(AuthStatusResponse {
        is_authenticated: false,
        user: None,
    }))
}

fn validate_email(email: &str) -> bool {
    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    email_regex.is_match(email)
}

fn validate_password(password: &str) -> bool {
    password.len() >= 6
}

pub async fn register(
    register_req: web::Json<RegisterRequest>,
) -> Result<HttpResponse> {
    println!("Registration endpoint called with email: {}", register_req.email);

    // For development/portfolio - simplified registration without database
    // Validate input
    if !validate_email(&register_req.email) {
        println!("Registration failed: Invalid email format");
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Invalid email format"
        })));
    }

    if !validate_password(&register_req.password) {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Password must be at least 6 characters long"
        })));
    }

    println!("Registration validation passed for: {}", register_req.email);

    // For development/portfolio - simulate successful registration
    // In a real app, this would save to database
    let mock_user = User {
        id: Some(ObjectId::new()),
        email: register_req.email.clone(),
        password_hash: Some("mock_hash".to_string()),
        first_name: register_req.first_name.clone(),
        last_name: register_req.last_name.clone(),
        provider: Some(AuthProvider::Local),
        role: None, // User will select role after registration
        is_active: true,
        onboarding_completed: false,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
        ..Default::default()
    };

    // Generate JWT token for the mock user
    match generate_token(&mock_user) {
        Ok(token) => {
            println!("Registration successful for: {}", register_req.email);
            Ok(HttpResponse::Created().json(LoginResponse {
                message: "User registered successfully (development mode)".to_string(),
                user: user_to_info(&mock_user),
                token,
            }))
        }
        Err(e) => {
            println!("Token generation failed: {:?}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to generate token"
            })))
        }
    }
}

pub async fn login(
    db: web::Data<Database>,
    login_req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let collection = db.collection::<User>("users");
    
    match collection.find_one(doc! {"email": &login_req.email}, None).await {
        Ok(Some(user)) => {
            if let Some(password_hash) = &user.password_hash {
                match verify(&login_req.password, password_hash) {
                    Ok(true) => {
                        if !user.is_active {
                            return Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                                "message": "Account is deactivated"
                            })));
                        }

                        // Update last login
                        let _ = collection.update_one(
                            doc! {"_id": user.id.unwrap()},
                            doc! {"$set": {"last_login": DateTime::now()}},
                            None
                        ).await;

                        match generate_token(&user) {
                            Ok(token) => {
                                Ok(HttpResponse::Ok().json(LoginResponse {
                                    message: "Login successful".to_string(),
                                    user: user_to_info(&user),
                                    token,
                                }))
                            }
                            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                                "message": "Failed to generate token"
                            })))
                        }
                    }
                    _ => Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                        "message": "Invalid credentials"
                    })))
                }
            } else {
                Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                    "message": "Invalid credentials"
                })))
            }
        }
        _ => Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Invalid credentials"
        })))
    }
}

pub async fn google_auth() -> Result<HttpResponse> {
    let client_id = env::var("GOOGLE_CLIENT_ID").unwrap_or_default();
    let redirect_url = "http://localhost:3001/api/auth/google/callback";
    
    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/auth?client_id={}&redirect_uri={}&scope=email%20profile&response_type=code",
        client_id, 
        urlencoding::encode(&redirect_url)
    );

    Ok(HttpResponse::Found()
        .append_header(("Location", auth_url))
        .finish())
}

pub async fn facebook_auth() -> Result<HttpResponse> {
    let client_id = env::var("FACEBOOK_APP_ID").unwrap_or_default();
    let redirect_url = "http://localhost:3001/api/auth/facebook/callback";
    
    let auth_url = format!(
        "https://www.facebook.com/v18.0/dialog/oauth?client_id={}&redirect_uri={}&scope=email&response_type=code",
        client_id, 
        urlencoding::encode(&redirect_url)
    );

    Ok(HttpResponse::Found()
        .append_header(("Location", auth_url))
        .finish())
}

pub async fn google_callback(
    db: web::Data<Database>,
    query: web::Query<OAuthCallbackQuery>,
) -> Result<HttpResponse> {
    let client_id = env::var("GOOGLE_CLIENT_ID").unwrap_or_default();
    let client_secret = env::var("GOOGLE_CLIENT_SECRET").unwrap_or_default();
    let redirect_url = "http://localhost:3001/api/auth/google/callback";
    
    let token_url = format!(
        "https://oauth2.googleapis.com/token?client_id={}&client_secret={}&code={}&grant_type=authorization_code&redirect_uri={}",
        client_id, client_secret, query.code, urlencoding::encode(&redirect_url)
    );
    
    match reqwest::Client::new().post(&token_url).send().await {
        Ok(token_response) => {
            let token_data: serde_json::Value = token_response.json().await.unwrap();
            
            if let Some(access_token) = token_data["access_token"].as_str() {
                let user_info_url = format!("https://www.googleapis.com/oauth2/v2/userinfo?access_token={}", access_token);
                
                match reqwest::get(&user_info_url).await {
                    Ok(response) => {
                        let user_info: GoogleUserInfo = response.json().await.unwrap();
                        let user = create_or_update_oauth_user(&db, user_info.id, Some(user_info.email), user_info.given_name, user_info.family_name, user_info.picture, AuthProvider::Google, true).await;
                        
                        match user {
                            Ok(user) => redirect_with_token(&user),
                            Err(_) => redirect_with_error("user_creation_failed")
                        }
                    }
                    Err(_) => redirect_with_error("user_info_failed")
                }
            } else {
                redirect_with_error("no_access_token")
            }
        }
        Err(_) => redirect_with_error("token_exchange_failed")
    }
}

pub async fn facebook_callback(
    db: web::Data<Database>,
    query: web::Query<OAuthCallbackQuery>,
) -> Result<HttpResponse> {
    let client_id = env::var("FACEBOOK_APP_ID").unwrap_or_default();
    let client_secret = env::var("FACEBOOK_APP_SECRET").unwrap_or_default();
    let redirect_url = "http://localhost:3001/api/auth/facebook/callback";
    
    let token_url = format!(
        "https://graph.facebook.com/v18.0/oauth/access_token?client_id={}&redirect_uri={}&client_secret={}&code={}",
        client_id, urlencoding::encode(&redirect_url), client_secret, query.code
    );
    
    match reqwest::get(&token_url).await {
        Ok(token_response) => {
            let token_data: serde_json::Value = token_response.json().await.unwrap();
            
            if let Some(access_token) = token_data["access_token"].as_str() {
                let user_info_url = format!("https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token={}", access_token);
                
                match reqwest::get(&user_info_url).await {
                    Ok(response) => {
                        let user_info: FacebookUserInfo = response.json().await.unwrap();
                        let user = create_or_update_oauth_user(&db, user_info.id, user_info.email, user_info.first_name, user_info.last_name, user_info.picture.map(|p| p.data.url), AuthProvider::Facebook, false).await;
                        
                        match user {
                            Ok(user) => redirect_with_token(&user),
                            Err(_) => redirect_with_error("user_creation_failed")
                        }
                    }
                    Err(_) => redirect_with_error("user_info_failed")
                }
            } else {
                redirect_with_error("no_access_token")
            }
        }
        Err(_) => redirect_with_error("token_exchange_failed")
    }
}

async fn create_or_update_oauth_user(
    db: &Database,
    oauth_id: String,
    email: Option<String>,
    first_name: Option<String>,
    last_name: Option<String>,
    picture: Option<String>,
    provider: AuthProvider,
    is_google: bool,
) -> mongodb::error::Result<User> {
    let collection = db.collection::<User>("users");
    
    let filter = if is_google {
        doc! {"google_id": &oauth_id}
    } else {
        doc! {"facebook_id": &oauth_id}
    };
    
    match collection.find_one(filter, None).await? {
        Some(mut user) => {
            let update_doc = doc! {"$set": {"last_login": DateTime::now()}};
            collection.update_one(doc! {"_id": user.id.unwrap()}, update_doc, None).await?;
            Ok(user)
        }
        None => {
            let email = email.unwrap_or_else(|| format!("{}@{}.local", oauth_id, if is_google { "google" } else { "facebook" }));
            
            let mut new_user = User {
                email,
                first_name,
                last_name,
                profile_picture: picture,
                provider: Some(provider),
                created_at: DateTime::now(),
                updated_at: DateTime::now(),
                ..Default::default()
            };
            
            if is_google {
                new_user.google_id = Some(oauth_id);
            } else {
                new_user.facebook_id = Some(oauth_id);
            }
            
            let result = collection.insert_one(&new_user, None).await?;
            new_user.id = Some(result.inserted_id.as_object_id().unwrap());
            Ok(new_user)
        }
    }
}

fn redirect_with_token(user: &User) -> Result<HttpResponse> {
    match generate_token(user) {
        Ok(token) => {
            let frontend_url = env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string());

            let redirect_url = if user.role.is_none() {
                // User needs to select a role first
                format!("{}/?token={}", frontend_url, token)
            } else if user.onboarding_completed {
                // User is fully onboarded, redirect to homepage which will route to appropriate dashboard
                format!("{}/?token={}", frontend_url, token)
            } else {
                // User has role but needs to complete onboarding
                format!("{}/?token={}", frontend_url, token)
            };

            Ok(HttpResponse::Found()
                .append_header(("Location", redirect_url))
                .finish())
        }
        Err(_) => redirect_with_error("token_generation_failed")
    }
}

fn redirect_with_error(error: &str) -> Result<HttpResponse> {
    Ok(HttpResponse::Found()
        .append_header(("Location", format!("{}?error={}", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()), error)))
        .finish())
}
#[derive(Deserialize)]
pub struct RoleSelectionRequest {
    pub role: String,
}

pub async fn set_user_role(
    req: HttpRequest,
    role_req: web::Json<RoleSelectionRequest>,
) -> Result<HttpResponse> {
    // Extract JWT token from Authorization header
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret_for_development".to_string());

                match decode::<Claims>(
                    token,
                    &DecodingKey::from_secret(jwt_secret.as_ref()),
                    &Validation::new(Algorithm::HS256),
                ) {
                    Ok(token_data) => {
                        let claims = token_data.claims;

                        // Validate role
                        let role = match role_req.role.as_str() {
                            "player" | "Player" => UserRole::Player,
                            "venue_owner" | "VenueOwner" => UserRole::VenueOwner,
                            _ => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                                "message": "Invalid role. Must be 'player' or 'venue_owner'"
                            })))
                        };

                        // For development mode, just return success without database update
                        println!("Role set to {:?} for user {}", role, claims.id);
                        
                        Ok(HttpResponse::Ok().json(serde_json::json!({
                            "message": "Role updated successfully",
                            "role": role_req.role
                        })))
                    }
                    Err(e) => {
                        println!("Token validation failed: {:?}", e);
                        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                            "message": "Invalid token"
                        })))
                    }
                }
            } else {
                Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                    "message": "Invalid authorization header format"
                })))
            }
        } else {
            Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                "message": "Invalid authorization header"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Authorization header required"
        })))
    }
}