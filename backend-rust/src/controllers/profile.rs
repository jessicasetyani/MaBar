use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use mongodb::{Database, bson::{doc, oid::ObjectId, DateTime}};
use crate::models::{User, PlayerProfile, UserRole};

#[derive(Deserialize)]
pub struct UpdateProfileRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub profile_picture: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdatePlayerProfileRequest {
    pub skill_level: Option<String>,
    pub play_style: Option<String>,
    pub availability: Option<Vec<String>>,
}

pub async fn get_profile(req: HttpRequest) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        Ok(HttpResponse::Ok().json(user))
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}

pub async fn update_profile(
    req: HttpRequest,
    db: web::Data<Database>,
    update_req: web::Json<UpdateProfileRequest>,
) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        let collection = db.collection::<User>("users");
        let user_id = user.id.as_ref().unwrap();
        
        let mut update_doc = doc! {"updated_at": DateTime::now()};
        if let Some(first_name) = &update_req.first_name {
            update_doc.insert("first_name", first_name);
        }
        if let Some(last_name) = &update_req.last_name {
            update_doc.insert("last_name", last_name);
        }
        if let Some(profile_picture) = &update_req.profile_picture {
            update_doc.insert("profile_picture", profile_picture);
        }
        
        match collection.update_one(
            doc! {"_id": user_id},
            doc! {"$set": update_doc},
            None
        ).await {
            Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Profile updated successfully"
            }))),
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to update profile"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}

pub async fn update_player_profile(
    req: HttpRequest,
    db: web::Data<Database>,
    update_req: web::Json<UpdatePlayerProfileRequest>,
) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        // Check if user is a player
        if !matches!(user.role, Some(UserRole::Player)) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Only players can update player profile"
            })));
        }

        let collection = db.collection::<User>("users");
        let user_id = user.id.as_ref().unwrap();
        
        // Get current profile or create new one
        let mut profile = user.profile.clone().unwrap_or_default();
        
        // Update profile fields
        if let Some(skill_level) = &update_req.skill_level {
            profile.skill_level = Some(skill_level.clone());
        }
        if let Some(play_style) = &update_req.play_style {
            profile.play_style = Some(play_style.clone());
        }
        if let Some(availability) = &update_req.availability {
            profile.availability = availability.clone();
        }
        
        let update_doc = doc! {
            "$set": {
                "profile": bson::to_bson(&profile).unwrap(),
                "updated_at": DateTime::now()
            }
        };
        
        match collection.update_one(
            doc! {"_id": user_id},
            update_doc,
            None
        ).await {
            Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Player profile updated successfully",
                "profile": profile
            }))),
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to update player profile"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}

pub async fn get_player_profile(req: HttpRequest) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        if !matches!(user.role, Some(UserRole::Player)) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Only players can access player profile"
            })));
        }

        let profile = user.profile.clone().unwrap_or_default();
        Ok(HttpResponse::Ok().json(serde_json::json!({
            "profile": profile
        })))
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}