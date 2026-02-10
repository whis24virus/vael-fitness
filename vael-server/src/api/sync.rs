use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Deserialize, Debug)]
pub struct SyncRequest {
    pub workouts: Vec<WorkoutSync>,
}

#[derive(Deserialize, Debug)]
pub struct WorkoutSync {
    pub id: Uuid,
    pub user_id: Uuid, // In real app, this comes from JWT
    pub name: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub status: String,
    pub volume_kg: Option<f64>,
    pub last_modified: DateTime<Utc>,
}

pub async fn sync_data(
    State(pool): State<PgPool>,
    Json(payload): Json<SyncRequest>,
) -> impl IntoResponse {
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            tracing::error!("Failed to begin transaction: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response();
        }
    };

    for workout in payload.workouts {
        // Generate summary for embedding
        let summary = format!(
            "Workout: {}. Status: {}. Volume: {}kg. Date: {}", 
            workout.name, 
            workout.status, 
            workout.volume_kg.unwrap_or(0.0), 
            workout.start_time
        );
        let embedding = crate::service::embeddings::generate_embedding(&summary).await;

        let embedding_vector = embedding.map(pgvector::Vector::from);

        // Upsert logic (Last Write Wins based on time, but mostly trusting client for now)
        let result = sqlx::query(
            r#"
            INSERT INTO workouts (id, user_id, name, start_time, end_time, status, volume_kg, created_at, embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE
            SET 
                name = EXCLUDED.name,
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                status = EXCLUDED.status,
                volume_kg = EXCLUDED.volume_kg,
                created_at = EXCLUDED.created_at,
                embedding = EXCLUDED.embedding
            WHERE workouts.created_at < EXCLUDED.created_at -- Simple LWW conflict resolution
            "#
        )
        .bind(workout.id)
        .bind(workout.user_id)
        .bind(workout.name)
        .bind(workout.start_time)
        .bind(workout.end_time)
        .bind(workout.status)
        .bind(workout.volume_kg)
        .bind(workout.last_modified)
        .bind(embedding_vector)
        .execute(&mut *tx)
        .await;

        if let Err(e) = result {
             tracing::error!("Failed to sync workout {}: {:?}", workout.id, e);
             // Verify transaction rollback on error or continue? 
             // For now, we'll log and continue best-effort
        }
    }

    if let Err(e) = tx.commit().await {
        tracing::error!("Failed to commit transaction: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to commit sync").into_response();
    }

    (StatusCode::OK, Json(json!({ "status": "synced" }))).into_response()
}
