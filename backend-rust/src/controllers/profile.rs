use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use mongodb::{Database, bson::{doc, oid::ObjectId}};
use crate::models::User;

#[derive(Deserialize)]
pub struct UpdateProfileRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub profile_picture: Option<String>,
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
        
        let mut update_doc = doc! {};
        if let Some(first_name) = &update_req.first_name {
            update_doc.insert("firstName", first_name);
        }
        if let Some(last_name) = &update_req.last_name {
            update_doc.insert("lastName", last_name);
        }
        if let Some(profile_picture) = &update_req.profile_picture {
            update_doc.insert("profilePicture", profile_picture);
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