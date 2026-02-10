use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use crate::service::auth::AuthService;

#[derive(Deserialize)]
pub struct AuthPayload {
    email: String,
    password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    token: String,
}

pub async fn register(
    State(pool): State<PgPool>,
    Json(payload): Json<AuthPayload>,
) -> impl IntoResponse {
    // 1. Hash password
    let password_hash = match AuthService::hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password").into_response(),
    };

    // 2. Insert into DB
    let result = sqlx::query!(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
        payload.email,
        password_hash
    )
    .fetch_one(&pool)
    .await;

    match result {
        Ok(_) => (StatusCode::CREATED, Json(json!({ "message": "User created" }))).into_response(),
        Err(e) => {
            tracing::error!("Database error: {:?}", e);
             (StatusCode::CONFLICT, "User already exists").into_response()
        }
    }
}

pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<AuthPayload>,
) -> impl IntoResponse {
    // 1. Fetch user
    let user = sqlx::query!(
        "SELECT id, password_hash FROM users WHERE email = $1",
        payload.email
    )
    .fetch_optional(&pool)
    .await;

    match user {
        Ok(Some(record)) => {
            // 2. Verify password
            let is_valid = AuthService::verify_password(&payload.password, &record.password_hash).unwrap_or(false);
            
            if is_valid {
                // TODO: Generate real JWT
                let token = "fake-jwt-token-for-now".to_string(); 
                (StatusCode::OK, Json(AuthResponse { token })).into_response()
            } else {
                (StatusCode::UNAUTHORIZED, "Invalid credentials").into_response()
            }
        }
        Ok(None) => (StatusCode::UNAUTHORIZED, "Invalid credentials").into_response(),
        Err(e) => {
            tracing::error!("Database error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response()
        }
    }
}
