use actix_web::{dev::ServiceRequest, Error, HttpMessage, HttpResponse, Result, web};
use actix_web_httpauth::extractors::bearer::{BearerAuth, Config};
use actix_web_httpauth::extractors::AuthenticationError;
use actix_web_httpauth::middleware::HttpAuthentication;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use mongodb::{Database, bson::{doc, oid::ObjectId}};
use std::env;
use crate::models::{User, UserRole};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub exp: usize,
}

pub async fn jwt_validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let token = credentials.token();
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());
    
    match decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    ) {
        Ok(token_data) => {
            let db = req.app_data::<web::Data<Database>>().unwrap();
            
            match ObjectId::parse_str(&token_data.claims.id) {
                Ok(user_id) => {
                    let collection = db.collection::<User>("users");
                    match collection.find_one(doc! {"_id": user_id}, None).await {
                        Ok(Some(user)) => {
                            if user.is_active {
                                req.extensions_mut().insert(user);
                                Ok(req)
                            } else {
                                let config = req.app_data::<Config>().cloned().unwrap_or_default();
                                Err((AuthenticationError::from(config).into(), req))
                            }
                        }
                        _ => {
                            let config = req.app_data::<Config>().cloned().unwrap_or_default();
                            Err((AuthenticationError::from(config).into(), req))
                        }
                    }
                }
                Err(_) => {
                    let config = req.app_data::<Config>().cloned().unwrap_or_default();
                    Err((AuthenticationError::from(config).into(), req))
                }
            }
        }
        Err(_) => {
            let config = req.app_data::<Config>().cloned().unwrap_or_default();
            Err((AuthenticationError::from(config).into(), req))
        }
    }
}

pub fn auth_middleware() -> HttpAuthentication<BearerAuth, fn(ServiceRequest, BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)>> {
    HttpAuthentication::bearer(jwt_validator)
}

pub fn require_role(allowed_roles: Vec<UserRole>) -> impl Fn(&User) -> Result<(), HttpResponse> {
    move |user: &User| {
        if allowed_roles.contains(&user.role) {
            Ok(())
        } else {
            Err(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Access denied. Insufficient permissions."
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