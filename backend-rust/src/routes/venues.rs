use actix_web::web;
use crate::controllers::venues::*;
use crate::middleware::auth::auth_middleware;

pub fn configure_venue_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/venues")
            .route("", web::post().to(create_venue))
            .route("", web::get().to(get_venues))
            .route("/{id}", web::get().to(get_venue_by_id))
            .route("/{id}", web::put().to(update_venue).wrap(auth_middleware()))
            .route("/{id}/status", web::patch().to(update_venue_status).wrap(auth_middleware()))
    );
}