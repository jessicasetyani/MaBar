mod config;
mod controllers;
mod middleware;
mod models;
mod routes;
mod services;
mod utils;

use actix_web::{web, App, HttpServer, middleware::Logger, HttpResponse, Result};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;
use config::DatabaseConfig;
use routes::*;
use middleware::SecurityHeaders;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    // Initialize database connection
    let db_config = DatabaseConfig::new().await
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    let port = env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let bind_address = format!("127.0.0.1:{}", port);

    println!("🚀 MaBar Rust Backend starting on {}", bind_address);

    let db_data = web::Data::new(db_config.clone());
    
    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin(&env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string()))
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization", "X-CSRF-Token"])
            .supports_credentials();

        App::new()
            .app_data(db_data.clone())
            .wrap(SecurityHeaders)
            .wrap(cors)
            .wrap(Logger::default())
            .route("/", web::get().to(|| async { "MaBar Rust Backend API" }))
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(|| async { "OK" }))
                    .route("/db-health", web::get().to(db_health_check))
                    .configure(configure_auth_routes)
                    .configure(configure_profile_routes)
                    .configure(configure_admin_routes)
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