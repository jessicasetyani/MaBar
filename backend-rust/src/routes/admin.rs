use actix_web::web;
use crate::controllers::admin::*;

pub fn configure_admin_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/admin")
            .route("/venues/pending", web::get().to(get_pending_venues))
            .route("/venues/{id}/approve", web::post().to(approve_venue))
            .route("/venues/{id}/reject", web::post().to(reject_venue))
    );
}