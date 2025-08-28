use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, EncodingKey, Header, Algorithm};
use bcrypt::{verify, hash, DEFAULT_COST};
use mongodb::{Database, bson::{doc, oid::ObjectId, DateTime}};
use std::env;
use regex::Regex;
use oauth2::{AuthUrl, ClientId, ClientSecret, RedirectUrl, TokenUrl, CsrfToken, Scope};
use oauth2::basic::BasicClient;
use reqwest;
use crate::models::{User, UserRole, AuthProvider};
use crate::middleware::simple_auth::Claims;

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

fn generate_token(user: &User) -> Result<String, jsonwebtoken::errors::Error> {
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());
    let jwt_expire = env::var("JWT_EXPIRE").unwrap_or_else(|_| "7d".to_string());
    
    let exp = match jwt_expire.as_str() {
        "7d" => chrono::Utc::now().timestamp() as usize + 7 * 24 * 60 * 60,
        _ => chrono::Utc::now().timestamp() as usize + 7 * 24 * 60 * 60,
    };

    let claims = Claims {
        id: user.id.as_ref().unwrap().to_hex(),
        exp,
    };

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
    db: web::Data<Database>,
    login_req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let collection = db.collection::<User>("users");
    
    match collection.find_one(doc! {"email": &login_req.email}, None).await {
        Ok(Some(user)) => {
            if !matches!(user.role, Some(UserRole::Admin)) {
                return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                    "message": "Access denied. Admin role required."
                })));
            }

            if let Some(password_hash) = &user.password_hash {
                match verify(&login_req.password, password_hash) {
                    Ok(true) => {
                        if !user.is_active {
                            return Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                                "message": "Account is deactivated."
                            })));
                        }

                        match generate_token(&user) {
                            Ok(token) => {
                                Ok(HttpResponse::Ok().json(LoginResponse {
                                    message: "Admin login successful".to_string(),
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

pub async fn admin_logout() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Admin logged out successfully"
    })))
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

pub async fn auth_status(req: HttpRequest) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        Ok(HttpResponse::Ok().json(AuthStatusResponse {
            is_authenticated: true,
            user: Some(user_to_info(user)),
        }))
    } else {
        Ok(HttpResponse::Ok().json(AuthStatusResponse {
            is_authenticated: false,
            user: None,
        }))
    }
}

fn validate_email(email: &str) -> bool {
    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    email_regex.is_match(email)
}

fn validate_password(password: &str) -> bool {
    password.len() >= 6
}

pub async fn register(
    db: web::Data<Database>,
    register_req: web::Json<RegisterRequest>,
) -> Result<HttpResponse> {
    // Validate input
    if !validate_email(&register_req.email) {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Invalid email format"
        })));
    }

    if !validate_password(&register_req.password) {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Password must be at least 6 characters long"
        })));
    }

    let collection = db.collection::<User>("users");
    
    // Check if user already exists
    if let Ok(Some(_)) = collection.find_one(doc! {"email": &register_req.email}, None).await {
        return Ok(HttpResponse::Conflict().json(serde_json::json!({
            "message": "User with this email already exists"
        })));
    }

    // Hash password
    let password_hash = match hash(&register_req.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to hash password"
            })));
        }
    };

    // Create new user
    let mut new_user = User {
        email: register_req.email.clone(),
        password_hash: Some(password_hash),
        first_name: register_req.first_name.clone(),
        last_name: register_req.last_name.clone(),
        provider: AuthProvider::Local,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
        ..Default::default()
    };

    // Insert user into database
    match collection.insert_one(&new_user, None).await {
        Ok(result) => {
            new_user.id = Some(result.inserted_id.as_object_id().unwrap());
            
            // Generate JWT token
            match generate_token(&new_user) {
                Ok(token) => {
                    Ok(HttpResponse::Created().json(LoginResponse {
                        message: "Registration successful".to_string(),
                        user: user_to_info(&new_user),
                        token,
                    }))
                }
                Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                    "message": "Failed to generate token"
                })))
            }
        }
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "message": "Failed to create user"
        })))
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
    let redirect_url = format!("{}/auth/google/callback", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()));
    
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
    let redirect_url = format!("{}/auth/facebook/callback", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()));
    
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
    let redirect_url = format!("{}/auth/google/callback", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()));
    
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
    let redirect_url = format!("{}/auth/facebook/callback", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()));
    
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
                provider,
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
            let redirect_url = if user.onboarding_completed {
                format!("{}/dashboard?token={}", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()), token)
            } else {
                format!("{}/onboarding?token={}", env::var("FRONTEND_URL").unwrap_or("http://localhost:5000".to_string()), token)
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
    db: web::Data<Database>,
    role_req: web::Json<RoleSelectionRequest>,
) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        let role = match role_req.role.as_str() {
            "Player" => UserRole::Player,
            "VenueOwner" => UserRole::VenueOwner,
            _ => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "message": "Invalid role. Must be 'Player' or 'VenueOwner'"
            })))
        };

        let collection = db.collection::<User>("users");
        match collection.update_one(
            doc! {"_id": user.id.unwrap()},
            doc! {"$set": {"role": role_req.role.as_str(), "updated_at": DateTime::now()}},
            None
        ).await {
            Ok(_) => {
                Ok(HttpResponse::Ok().json(serde_json::json!({
                    "message": "Role updated successfully",
                    "role": role_req.role
                })))
            }
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to update role"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}