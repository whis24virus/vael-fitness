use axum::{response::IntoResponse, Json};
use serde_json::json;

pub async fn health_check() -> impl IntoResponse {
    const MESSAGE: &str = "Omega Tier Backend Online";
    Json(json!({ "status": "ok", "message": MESSAGE }))
}
