use actix_web::{dev::ServiceRequest, Error, HttpMessage, HttpResponse, Result, web, FromRequest};
use actix_web::dev::Payload;
use futures_util::future::{Ready, ready};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use mongodb::{Database, bson::{doc, oid::ObjectId}};
use std::env;
use crate::models::User;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub exp: usize,
}

pub struct AuthenticatedUser(pub User);

impl FromRequest for AuthenticatedUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &actix_web::HttpRequest, _: &mut Payload) -> Self::Future {
        if let Some(user) = req.extensions().get::<User>() {
            ready(Ok(AuthenticatedUser(user.clone())))
        } else {
            ready(Err(actix_web::error::ErrorUnauthorized("Not authenticated")))
        }
    }
}

pub async fn simple_auth_middleware(
    req: ServiceRequest,
    db: web::Data<Database>,
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let auth_header = req.headers().get("authorization");
    
    if let Some(auth_value) = auth_header {
        if let Ok(auth_str) = auth_value.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());
                
                if let Ok(token_data) = decode::<Claims>(
                    token,
                    &DecodingKey::from_secret(jwt_secret.as_ref()),
                    &Validation::new(Algorithm::HS256),
                ) {
                    if let Ok(user_id) = ObjectId::parse_str(&token_data.claims.id) {
                        let collection = db.collection::<User>("users");
                        if let Ok(Some(user)) = collection.find_one(doc! {"_id": user_id}, None).await {
                            if user.is_active {
                                req.extensions_mut().insert(user);
                                return Ok(req);
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(req) // Continue without authentication for optional auth
}