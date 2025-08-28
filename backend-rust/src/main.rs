mod config;
mod controllers;
mod middleware;
mod models;
mod routes;
mod services;
mod utils;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let port = env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let bind_address = format!("127.0.0.1:{}", port);

    println!("🚀 MaBar Rust Backend starting on {}", bind_address);

    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin(&env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string()))
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization", "X-CSRF-Token"])
            .supports_credentials();

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .route("/", web::get().to(|| async { "MaBar Rust Backend API" }))
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(|| async { "OK" }))
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}