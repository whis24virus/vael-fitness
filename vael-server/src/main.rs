mod api;
mod db;
mod service;

use axum::{routing::get, Router};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "vael_server=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Initialize Database
    dotenvy::dotenv().ok();
    let pool = db::init_pool().await;

    // build our application with a route
    let app = Router::new()
        .route("/health", get(api::health::health_check))
        .route("/auth/register", axum::routing::post(api::auth::register))
        .route("/auth/login", axum::routing::post(api::auth::login))
        .route("/sync", axum::routing::post(api::sync::sync_data))
        .route("/api/chat", axum::routing::post(api::chat::chat_handler))
        .with_state(pool)
        .layer(cors);

    // run it
    let port = std::env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("listening on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
