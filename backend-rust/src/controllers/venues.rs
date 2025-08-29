use actix_web::{web, HttpResponse, Result};
use bson::{doc, oid::ObjectId, DateTime};
use mongodb::Collection;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::config::DatabaseConfig;
use crate::models::venue::{Venue, VenueStatus, GeoLocation};

#[derive(Debug, Deserialize)]
pub struct CreateVenueRequest {
    pub name: String,
    pub description: Option<String>,
    pub address: String,
    pub phone: Option<String>,
    pub price_per_hour: f64,
    pub number_of_courts: i32,
    pub amenities: Vec<String>,
    pub operating_hours: HashMap<String, String>,
    pub photos: Vec<String>,
    pub location: GeoLocationRequest,
}

#[derive(Debug, Deserialize)]
pub struct GeoLocationRequest {
    pub coordinates: [f64; 2], // [longitude, latitude]
}

#[derive(Debug, Serialize)]
pub struct VenueResponse {
    pub success: bool,
    pub message: String,
    pub venue: Option<Venue>,
}

pub async fn create_venue(
    db_config: web::Data<DatabaseConfig>,
    venue_data: web::Json<CreateVenueRequest>,
) -> Result<HttpResponse> {
    let collection: Collection<Venue> = db_config.get_database().collection("venues");
    
    // Validate required fields
    if venue_data.name.trim().is_empty() {
        return Ok(HttpResponse::BadRequest().json(VenueResponse {
            success: false,
            message: "Venue name is required".to_string(),
            venue: None,
        }));
    }
    
    if venue_data.address.trim().is_empty() {
        return Ok(HttpResponse::BadRequest().json(VenueResponse {
            success: false,
            message: "Venue address is required".to_string(),
            venue: None,
        }));
    }
    
    if venue_data.price_per_hour <= 0.0 {
        return Ok(HttpResponse::BadRequest().json(VenueResponse {
            success: false,
            message: "Price per hour must be greater than 0".to_string(),
            venue: None,
        }));
    }
    
    if venue_data.number_of_courts <= 0 {
        return Ok(HttpResponse::BadRequest().json(VenueResponse {
            success: false,
            message: "Number of courts must be greater than 0".to_string(),
            venue: None,
        }));
    }

    // Create new venue
    let new_venue = Venue {
        id: None,
        name: venue_data.name.clone(),
        description: venue_data.description.clone(),
        address: venue_data.address.clone(),
        phone: venue_data.phone.clone(),
        owner: ObjectId::new(), // TODO: Get from authenticated user
        price_per_hour: venue_data.price_per_hour,
        number_of_courts: venue_data.number_of_courts,
        amenities: venue_data.amenities.clone(),
        operating_hours: venue_data.operating_hours.clone(),
        photos: venue_data.photos.clone(),
        location: GeoLocation {
            location_type: "Point".to_string(),
            coordinates: venue_data.location.coordinates,
        },
        status: VenueStatus::Pending,
        admin_notes: None,
        reviewed_by: None,
        reviewed_at: None,
        is_active: true,
        average_rating: 0.0,
        total_reviews: 0,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
    };

    match collection.insert_one(&new_venue, None).await {
        Ok(result) => {
            let mut created_venue = new_venue;
            created_venue.id = Some(result.inserted_id.as_object_id().unwrap());
            
            Ok(HttpResponse::Created().json(VenueResponse {
                success: true,
                message: "Venue submitted successfully for review".to_string(),
                venue: Some(created_venue),
            }))
        }
        Err(e) => {
            eprintln!("Failed to create venue: {}", e);
            Ok(HttpResponse::InternalServerError().json(VenueResponse {
                success: false,
                message: "Failed to submit venue".to_string(),
                venue: None,
            }))
        }
    }
}

pub async fn get_venues(
    db_config: web::Data<DatabaseConfig>,
    query: web::Query<HashMap<String, String>>,
) -> Result<HttpResponse> {
    let collection: Collection<Venue> = db_config.get_database().collection("venues");
    
    let mut filter = doc! {};
    
    // Filter by status if provided
    if let Some(status) = query.get("status") {
        match status.as_str() {
            "pending" => filter.insert("status", "pending"),
            "approved" => filter.insert("status", "approved"),
            "rejected" => filter.insert("status", "rejected"),
            _ => None,
        };
    }
    
    // Only show active venues by default
    if !query.contains_key("include_inactive") {
        filter.insert("is_active", true);
    }

    match collection.find(filter, None).await {
        Ok(mut cursor) => {
            let mut venues = Vec::new();
            while cursor.advance().await.unwrap_or(false) {
                if let Ok(venue) = cursor.deserialize_current() {
                    venues.push(venue);
                }
            }
            
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "venues": venues,
                "count": venues.len()
            })))
        }
        Err(e) => {
            eprintln!("Failed to fetch venues: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "message": "Failed to fetch venues"
            })))
        }
    }
}

pub async fn get_venue_by_id(
    db_config: web::Data<DatabaseConfig>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let venue_id = path.into_inner();
    
    let object_id = match ObjectId::parse_str(&venue_id) {
        Ok(id) => id,
        Err(_) => {
            return Ok(HttpResponse::BadRequest().json(VenueResponse {
                success: false,
                message: "Invalid venue ID format".to_string(),
                venue: None,
            }));
        }
    };

    let collection: Collection<Venue> = db_config.get_database().collection("venues");
    
    match collection.find_one(doc! { "_id": object_id }, None).await {
        Ok(Some(venue)) => {
            Ok(HttpResponse::Ok().json(VenueResponse {
                success: true,
                message: "Venue found".to_string(),
                venue: Some(venue),
            }))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(VenueResponse {
                success: false,
                message: "Venue not found".to_string(),
                venue: None,
            }))
        }
        Err(e) => {
            eprintln!("Failed to fetch venue: {}", e);
            Ok(HttpResponse::InternalServerError().json(VenueResponse {
                success: false,
                message: "Failed to fetch venue".to_string(),
                venue: None,
            }))
        }
    }
}

pub async fn update_venue(
    db_config: web::Data<DatabaseConfig>,
    path: web::Path<String>,
    venue_data: web::Json<CreateVenueRequest>,
) -> Result<HttpResponse> {
    let venue_id = path.into_inner();
    
    let object_id = match ObjectId::parse_str(&venue_id) {
        Ok(id) => id,
        Err(_) => {
            return Ok(HttpResponse::BadRequest().json(VenueResponse {
                success: false,
                message: "Invalid venue ID format".to_string(),
                venue: None,
            }));
        }
    };

    let collection: Collection<Venue> = db_config.get_database().collection("venues");
    
    let update_doc = doc! {
        "$set": {
            "name": &venue_data.name,
            "description": &venue_data.description,
            "address": &venue_data.address,
            "phone": &venue_data.phone,
            "price_per_hour": venue_data.price_per_hour,
            "number_of_courts": venue_data.number_of_courts,
            "amenities": &venue_data.amenities,
            "operating_hours": bson::to_bson(&venue_data.operating_hours).unwrap(),
            "photos": &venue_data.photos,
            "location": {
                "type": "Point",
                "coordinates": bson::to_bson(&venue_data.location.coordinates).unwrap()
            },
            "updated_at": DateTime::now()
        }
    };

    match collection.update_one(doc! { "_id": object_id }, update_doc, None).await {
        Ok(result) => {
            if result.matched_count > 0 {
                Ok(HttpResponse::Ok().json(serde_json::json!({
                    "success": true,
                    "message": "Venue updated successfully"
                })))
            } else {
                Ok(HttpResponse::NotFound().json(VenueResponse {
                    success: false,
                    message: "Venue not found".to_string(),
                    venue: None,
                }))
            }
        }
        Err(e) => {
            eprintln!("Failed to update venue: {}", e);
            Ok(HttpResponse::InternalServerError().json(VenueResponse {
                success: false,
                message: "Failed to update venue".to_string(),
                venue: None,
            }))
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct UpdateVenueStatusRequest {
    pub status: String,
    pub admin_notes: Option<String>,
}

pub async fn update_venue_status(
    db_config: web::Data<DatabaseConfig>,
    path: web::Path<String>,
    status_data: web::Json<UpdateVenueStatusRequest>,
) -> Result<HttpResponse> {
    let venue_id = path.into_inner();
    
    let object_id = match ObjectId::parse_str(&venue_id) {
        Ok(id) => id,
        Err(_) => {
            return Ok(HttpResponse::BadRequest().json(VenueResponse {
                success: false,
                message: "Invalid venue ID format".to_string(),
                venue: None,
            }));
        }
    };

    let status = match status_data.status.as_str() {
        "approved" => VenueStatus::Approved,
        "rejected" => VenueStatus::Rejected,
        "pending" => VenueStatus::Pending,
        _ => {
            return Ok(HttpResponse::BadRequest().json(VenueResponse {
                success: false,
                message: "Invalid status. Must be 'approved', 'rejected', or 'pending'".to_string(),
                venue: None,
            }));
        }
    };

    let collection: Collection<Venue> = db_config.get_database().collection("venues");
    
    let update_doc = doc! {
        "$set": {
            "status": &status_data.status,
            "admin_notes": &status_data.admin_notes,
            "reviewed_by": ObjectId::new(), // TODO: Get from authenticated admin
            "reviewed_at": DateTime::now(),
            "updated_at": DateTime::now()
        }
    };

    match collection.update_one(doc! { "_id": object_id }, update_doc, None).await {
        Ok(result) => {
            if result.matched_count > 0 {
                Ok(HttpResponse::Ok().json(serde_json::json!({
                    "success": true,
                    "message": format!("Venue status updated to {}", status_data.status)
                })))
            } else {
                Ok(HttpResponse::NotFound().json(VenueResponse {
                    success: false,
                    message: "Venue not found".to_string(),
                    venue: None,
                }))
            }
        }
        Err(e) => {
            eprintln!("Failed to update venue status: {}", e);
            Ok(HttpResponse::InternalServerError().json(VenueResponse {
                success: false,
                message: "Failed to update venue status".to_string(),
                venue: None,
            }))
        }
    }
}