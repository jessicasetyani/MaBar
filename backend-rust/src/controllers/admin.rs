use actix_web::{web, HttpRequest, HttpResponse, Result, HttpMessage};
use serde::{Deserialize, Serialize};
use mongodb::{Database, bson::{doc, oid::ObjectId}};
use crate::models::{User, UserRole, Venue, VenueStatus};

#[derive(Deserialize)]
pub struct VenueActionRequest {
    pub admin_notes: Option<String>,
}

pub async fn get_pending_venues(
    req: HttpRequest,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        if !matches!(user.role, UserRole::Admin) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Admin access required"
            })));
        }

        let collection = db.collection::<Venue>("venues");
        match collection.find(doc! {"status": "pending"}, None).await {
            Ok(mut cursor) => {
                let mut venues = Vec::new();
                while cursor.advance().await.unwrap_or(false) {
                    if let Ok(venue) = cursor.deserialize_current() {
                        venues.push(venue);
                    }
                }
                Ok(HttpResponse::Ok().json(venues))
            }
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to fetch venues"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}

pub async fn approve_venue(
    req: HttpRequest,
    db: web::Data<Database>,
    path: web::Path<String>,
    action_req: web::Json<VenueActionRequest>,
) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        if !matches!(user.role, UserRole::Admin) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Admin access required"
            })));
        }

        let venue_id = match ObjectId::parse_str(&path.into_inner()) {
            Ok(id) => id,
            Err(_) => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "message": "Invalid venue ID"
            })))
        };

        let collection = db.collection::<Venue>("venues");
        let admin_id = user.id.as_ref().unwrap();
        
        match collection.update_one(
            doc! {"_id": venue_id},
            doc! {
                "$set": {
                    "status": "approved",
                    "adminNotes": action_req.admin_notes.as_deref().unwrap_or(""),
                    "reviewedBy": admin_id,
                    "reviewedAt": bson::DateTime::now()
                }
            },
            None
        ).await {
            Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Venue approved successfully"
            }))),
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to approve venue"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}

pub async fn reject_venue(
    req: HttpRequest,
    db: web::Data<Database>,
    path: web::Path<String>,
    action_req: web::Json<VenueActionRequest>,
) -> Result<HttpResponse> {
    if let Some(user) = req.extensions().get::<User>() {
        if !matches!(user.role, UserRole::Admin) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "message": "Admin access required"
            })));
        }

        let admin_notes = match &action_req.admin_notes {
            Some(notes) if !notes.trim().is_empty() => notes,
            _ => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "message": "Admin notes are required when rejecting a venue"
            })))
        };

        let venue_id = match ObjectId::parse_str(&path.into_inner()) {
            Ok(id) => id,
            Err(_) => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "message": "Invalid venue ID"
            })))
        };

        let collection = db.collection::<Venue>("venues");
        let admin_id = user.id.as_ref().unwrap();
        
        match collection.update_one(
            doc! {"_id": venue_id},
            doc! {
                "$set": {
                    "status": "rejected",
                    "adminNotes": admin_notes,
                    "reviewedBy": admin_id,
                    "reviewedAt": bson::DateTime::now()
                }
            },
            None
        ).await {
            Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
                "message": "Venue rejected successfully"
            }))),
            Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Failed to reject venue"
            })))
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Not authenticated"
        })))
    }
}