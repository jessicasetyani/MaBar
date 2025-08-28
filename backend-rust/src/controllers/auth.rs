use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, EncodingKey, Header, Algorithm};
use bcrypt::verify;
use mongodb::{Database, bson::{doc, oid::ObjectId}};
use std::env;
use crate::models::{User, UserRole};
use crate::middleware::simple_auth::Claims;

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
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
        email: user.email.clone(),
        role: user.role.clone(),
        first_name: user.first_name.clone(),
        last_name: user.last_name.clone(),
        name: if name.is_empty() { "User".to_string() } else { name },
    }
}

pub async fn admin_login(
    db: web::Data<Database>,
    login_req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let collection = db.collection::<User>("users");
    
    match collection.find_one(doc! {"email": &login_req.email}, None).await {
        Ok(Some(user)) => {
            if !matches!(user.role, UserRole::Admin) {
                return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                    "message": "Access denied. Admin role required."
                })));
            }

            if let Some(password_hash) = &user.password {
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