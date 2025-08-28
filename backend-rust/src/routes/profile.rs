use actix_web::web;
use crate::controllers::profile::*;
use crate::middleware::auth::auth_middleware;

pub fn configure_profile_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/profile")
            .wrap(auth_middleware())
            .route("", web::get().to(get_profile))
            .route("", web::put().to(update_profile))
            .route("/player", web::get().to(get_player_profile))
            .route("/player", web::put().to(update_player_profile))
    );
}