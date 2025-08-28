use actix_web::web;
use crate::controllers::profile::*;

pub fn configure_profile_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/profile")
            .route("", web::get().to(get_profile))
            .route("", web::put().to(update_profile))
    );
}