use fastembed::{TextEmbedding, InitOptions, EmbeddingModel};
use std::sync::Arc;
use tokio::sync::{OnceCell, Mutex};

static EMBEDDING_MODEL: OnceCell<Arc<Mutex<TextEmbedding>>> = OnceCell::const_new();

pub async fn get_model() -> Arc<Mutex<TextEmbedding>> {
    EMBEDDING_MODEL.get_or_init(|| async {
        let model = TextEmbedding::try_new(InitOptions::new(EmbeddingModel::AllMiniLML6V2))
            .expect("Failed to load embedding model");
        Arc::new(Mutex::new(model))
    }).await.clone()
}

pub async fn generate_embedding(text: &str) -> Option<Vec<f32>> {
    let model_arc = get_model().await;
    let mut model = model_arc.lock().await;
    let documents = vec![text.to_string()];
    
    // Generate embeddings
    match model.embed(documents, None) {
        Ok(embeddings) => embeddings.first().cloned(),
        Err(e) => {
            tracing::error!("Embedding generation failed: {:?}", e);
            None
        }
    }
}
