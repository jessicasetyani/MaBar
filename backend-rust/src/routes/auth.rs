use actix_web::web;
use crate::controllers::auth::*;

pub fn configure_auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/admin/login", web::post().to(admin_login))
            .route("/admin/logout", web::post().to(admin_logout))
            .route("/logout", web::post().to(logout))
            .route("/me", web::get().to(get_me))
            .route("/status", web::get().to(auth_status))
    );
}