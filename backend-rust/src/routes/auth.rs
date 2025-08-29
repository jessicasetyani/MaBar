use actix_web::web;
use crate::controllers::auth::*;
// use crate::middleware::auth::auth_middleware;

pub fn configure_auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/register", web::post().to(register))
            .route("/login", web::post().to(login))
            .route("/google", web::get().to(google_auth))
            .route("/facebook", web::get().to(facebook_auth))
            .route("/google/callback", web::get().to(google_callback))
            .route("/facebook/callback", web::get().to(facebook_callback))
            .route("/admin/login", web::post().to(admin_login))
            .route("/admin/logout", web::post().to(admin_logout))
            .route("/logout", web::post().to(logout))
            .route("/me", web::get().to(get_me))
            .route("/status", web::get().to(auth_status))
            .route("/role", web::post().to(set_user_role))
    );
}