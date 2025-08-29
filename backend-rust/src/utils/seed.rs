use crate::models::user::{User, UserRole};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use bson::{doc, DateTime};
use mongodb::{Collection, Database};
use std::env;

/// Seeds the database with an initial admin user
pub async fn seed_admin_user(db: &Database) -> Result<(), Box<dyn std::error::Error>> {
    let collection: Collection<User> = db.collection("users");
    
    // Get admin credentials from environment variables
    let admin_email = env::var("ADMIN_EMAIL")
        .unwrap_or_else(|_| "jessica@mabar.com".to_string());
    let admin_password = env::var("ADMIN_PASSWORD")
        .unwrap_or_else(|_| "Admin123!".to_string());
    let admin_first_name = env::var("ADMIN_FIRST_NAME")
        .unwrap_or_else(|_| "Admin".to_string());
    let admin_last_name = env::var("ADMIN_LAST_NAME")
        .unwrap_or_else(|_| "User".to_string());

    // Check if admin user already exists
    let existing_admin = collection
        .find_one(doc! {"email": &admin_email}, None)
        .await?;

    if existing_admin.is_some() {
        println!("Admin user already exists with email: {}", admin_email);
        return Ok(());
    }

    // Hash the password
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(admin_password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();

    // Create admin user
    let admin_user = User {
        id: None, // MongoDB will generate this
        email: admin_email.clone(),
        password_hash: Some(password_hash),
        first_name: Some(admin_first_name),
        last_name: Some(admin_last_name),
        role: Some(UserRole::Admin),
        is_active: true,
        onboarding_completed: true,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
        ..Default::default()
    };

    // Insert admin user
    let result = collection.insert_one(admin_user, None).await?;
    
    println!("✅ Admin user created successfully!");
    println!("   Email: {}", admin_email);
    println!("   ID: {}", result.inserted_id);
    println!("   ⚠️  Remember to change the default password in production!");

    Ok(())
}

/// Verifies admin credentials against environment variables (fallback for development)
pub fn verify_admin_credentials(email: &str, password: &str) -> bool {
    let admin_email = env::var("ADMIN_EMAIL")
        .unwrap_or_else(|_| "admin@mabar.com".to_string());
    let admin_password = env::var("ADMIN_PASSWORD")
        .unwrap_or_else(|_| "Admin123!".to_string());

    email == admin_email && password == admin_password
}

/// Creates a secure password hash
pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    Ok(argon2.hash_password(password.as_bytes(), &salt)?.to_string())
}

/// Verifies a password against a hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
    let parsed_hash = PasswordHash::new(hash)?;
    Ok(Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok())
}
