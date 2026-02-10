-- Add embedding column for vector search (384 dimensions for all-MiniLM-L6-v2)
ALTER TABLE workouts ADD COLUMN embedding vector(384);
