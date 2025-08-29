mod config;
mod controllers;
mod middleware;
mod models;
mod routes;
mod services;
mod utils;
mod security;

use actix_web::{web, App, HttpServer, middleware::Logger, HttpResponse, Result, HttpMessage};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;
use config::DatabaseConfig;
use routes::*;
use middleware::SecurityHeaders;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from root .env file (centralized configuration)
    dotenv::from_path("../.env").ok();
    env_logger::init();

    // Initialize database connection
    let db_config = DatabaseConfig::new().await
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    // Seed admin user if in development mode
    if env::var("DEVELOPMENT_MODE").unwrap_or("false".to_string()) == "true" {
        if let Err(e) = utils::seed::seed_admin_user(db_config.get_database()).await {
            eprintln!("⚠️  Warning: Failed to seed admin user: {}", e);
        }
    }

    let port = env::var("BACKEND_PORT")
        .or_else(|_| env::var("PORT"))
        .unwrap_or_else(|_| "5000".to_string());
    let host = env::var("BACKEND_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let bind_address = format!("{}:{}", host, port);

    println!("🚀 MaBar Rust Backend starting on {}", bind_address);

    let db_data = web::Data::new(db_config.clone());
    
    HttpServer::new(move || {
        let frontend_base = env::var("FRONTEND_BASE_URL").unwrap_or_else(|_| "http://localhost".to_string());
        let frontend_port = env::var("FRONTEND_PORT").unwrap_or_else(|_| "5173".to_string());
        let frontend_url = format!("{}:{}", frontend_base, frontend_port);

        let cors = Cors::default()
            .allowed_origin(&frontend_url)
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization", "X-CSRF-Token"])
            .supports_credentials();

        App::new()
            .app_data(db_data.clone())
            .wrap(SecurityHeaders)
            .wrap(cors)
            .wrap(Logger::default())
            .route("/", web::get().to(|| async { "MaBar Rust Backend API" }))
            .configure(configure_auth_routes)
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(|| async { "OK" }))
                    .route("/db-health", web::get().to(db_health_check))
                    .configure(configure_profile_routes)
                    .configure(configure_admin_routes)
                    .configure(configure_venue_routes)
                    // Removed security routes for simplification
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}

async fn db_health_check(db_config: web::Data<DatabaseConfig>) -> Result<HttpResponse> {
    match db_config.get_database().run_command(bson::doc! {"ping": 1}, None).await {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "status": "healthy",
            "database": "connected",
            "message": "Database connection successful"
        }))),
        Err(e) => Ok(HttpResponse::ServiceUnavailable().json(serde_json::json!({
            "status": "unhealthy",
            "database": "disconnected",
            "error": e.to_string()
        })))
    }
}