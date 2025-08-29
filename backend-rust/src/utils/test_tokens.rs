use jsonwebtoken::{encode, EncodingKey, Header, Algorithm};
use mongodb::bson::oid::ObjectId;
use crate::middleware::simple_auth::Claims;
use std::env;
use chrono;

/// Generate a test JWT token for development/testing purposes
pub fn generate_test_token(user_id: &str, _email: &str, _role: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());

    let claims = Claims {
        id: user_id.to_string(),
        exp: (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize,
    };

    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
}

/// Generate test tokens for different user roles
pub fn generate_test_tokens() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Development JWT Test Tokens ===");
    println!("⚠️  FOR DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION ⚠️");
    println!();

    // Test Player token
    let player_id = ObjectId::new().to_hex();
    let player_token = generate_test_token(&player_id, "player@test.com", "Player")?;
    println!("Player Token:");
    println!("User ID: {}", player_id);
    println!("Token: {}", player_token);
    println!();

    // Test VenueOwner token
    let venue_owner_id = ObjectId::new().to_hex();
    let venue_owner_token = generate_test_token(&venue_owner_id, "owner@test.com", "VenueOwner")?;
    println!("VenueOwner Token:");
    println!("User ID: {}", venue_owner_id);
    println!("Token: {}", venue_owner_token);
    println!();

    // Test Admin token
    let admin_id = ObjectId::new().to_hex();
    let admin_token = generate_test_token(&admin_id, "admin@test.com", "Admin")?;
    println!("Admin Token:");
    println!("User ID: {}", admin_id);
    println!("Token: {}", admin_token);
    println!();

    println!("Test these tokens with:");
    println!("curl -H \"Authorization: Bearer <token>\" http://localhost:3001/auth/status");
    println!();

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_generation() {
        let user_id = ObjectId::new().to_hex();
        let token = generate_test_token(&user_id, "test@example.com", "Player");
        assert!(token.is_ok());
    }
}
