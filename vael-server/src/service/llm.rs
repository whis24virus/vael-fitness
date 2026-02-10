use async_openai::{
    types::{CreateChatCompletionRequestArgs, ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs, ChatCompletionRequestMessage},
    Client,
    config::OpenAIConfig,
};
use std::error::Error;

pub struct LlmService;

impl LlmService {
    pub async fn chat_completion(system_prompt: &str, user_message: &str) -> Result<String, Box<dyn Error>> {
        let config = OpenAIConfig::new()
            .with_api_key(std::env::var("GROQ_API_KEY")?)
            .with_api_base("https://api.groq.com/openai/v1");
            
        let client = Client::with_config(config);

        let request = CreateChatCompletionRequestArgs::default()
            .model("llama-3.3-70b-versatile")
            .messages([
                ChatCompletionRequestMessage::System(ChatCompletionRequestSystemMessageArgs::default().content(system_prompt).build()?),
                ChatCompletionRequestMessage::User(ChatCompletionRequestUserMessageArgs::default().content(user_message).build()?),
            ])
            .build()?;

        let response = client.chat().create(request).await?;

        Ok(response.choices[0].message.content.clone().unwrap_or_default())
    }
}
