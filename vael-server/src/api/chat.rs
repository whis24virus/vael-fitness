use axum::{
    response::IntoResponse,
    Json,
    http::StatusCode,
    extract::State,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::service::llm::LlmService;
use chrono::{DateTime, Utc};

#[derive(Deserialize)]
pub struct ChatRequest {
    message: String,
    // context: Option<String>, // For future RAG
}

#[derive(Serialize)]
pub struct ChatResponse {
    reply: String,
}

pub async fn chat_handler(
    State(pool): State<sqlx::PgPool>,
    Json(payload): Json<ChatRequest>,
) -> impl IntoResponse {
    // 1. Generate embedding for query
    let query_embedding = match crate::service::embeddings::generate_embedding(&payload.message).await {
        Some(e) => pgvector::Vector::from(e),
        None => return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to process query").into_response(),
    };

    // 2. Search for relevant workouts (RAG)
    use sqlx::Row;
    let relevant_workouts = sqlx::query(
        "SELECT name, status, volume_kg, start_time FROM workouts ORDER BY embedding <=> $1 LIMIT 3"
    )
    .bind(query_embedding)
    .fetch_all(&pool)
    .await;

    let mut context_str = String::from("");
    if let Ok(workouts) = relevant_workouts {
        if !workouts.is_empty() {
             context_str.push_str("Here is the user's relevant workout history:\n");
             for w in workouts {
                 let name: String = w.get("name");
                 let start_time: DateTime<Utc> = w.get("start_time");
                 let volume_kg: Option<f64> = w.get("volume_kg");
                 context_str.push_str(&format!("- {} on {} (Vol: {}kg)\n", name, start_time, volume_kg.unwrap_or(0.0)));
             }
        }
    }

    // 3. Construct System Prompt
    let system_prompt = format!(
        r#"You are VAEL, an elite fitness intelligence designed to forge human potential. 
Your demeanor is:
- **Harsh but Fair**: You do not accept excuses. You demand consistency.
- **Data-Driven**: You base your feedback on the `Relevant Workout History` provided below.
- **Concise**: Speak in short, punchy sentences. No fluff. Max 2-3 sentences.

Your Goal:
- Push the user to achieve Progressive Overload.
- Call them out if they are slacking (e.g., skipping days, low volume).
- Praising them ONLY when they break a personal best or show extreme consistency.

Relevant Workout History:
{}

If the history is empty, tell them they are a "ghost" and need to log data to exist.
"#, 
        context_str
    );
    
    match LlmService::chat_completion(&system_prompt, &payload.message).await {
        Ok(reply) => (StatusCode::OK, Json(ChatResponse { reply })).into_response(),
        Err(e) => {
            tracing::error!("LLM Error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to reach AI Coach" }))).into_response()
        }
    }
}
