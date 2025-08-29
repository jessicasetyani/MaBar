use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use mongodb::{Database, bson::{doc, oid::ObjectId, DateTime}};
use crate::models::{User, PlayerProfile, UserRole};

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    #[serde(rename = "firstName")]
    pub first_name: Option<String>,
    #[serde(rename = "lastName")]
    pub last_name: Option<String>,
    pub profile_picture: Option<String>,
    #[serde(rename = "skillLevel")]
    pub skill_level: Option<String>,
    pub location: Option<LocationData>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LocationData {
    pub city: Option<String>,
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
    update_req: web::Json<UpdateProfileRequest>,
) -> Result<HttpResponse> {
    // For development mode, just return success without database update
    println!("Profile update request: {:?}", update_req);
    
    // Validate that we have some data to update
    if update_req.first_name.is_none() && update_req.last_name.is_none() && 
       update_req.skill_level.is_none() && update_req.location.is_none() {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "message": "No data provided to update"
        })));
    }
    
    // In development mode, simulate successful update
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Profile updated successfully (development mode)",
        "data": {
            "firstName": update_req.first_name,
            "skillLevel": update_req.skill_level,
            "location": update_req.location
        }
    })))
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