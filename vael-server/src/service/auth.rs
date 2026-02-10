use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use std::error::Error;

pub struct AuthService;

impl AuthService {
    pub fn hash_password(password: &str) -> Result<String, Box<dyn Error>> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| format!("Hashing failed: {}", e))?
            .to_string();
        Ok(password_hash)
    }

    pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, Box<dyn Error>> {
        let parsed_hash = PasswordHash::new(password_hash)
            .map_err(|e| format!("Invalid hash format: {}", e))?;
        Ok(Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }
}
