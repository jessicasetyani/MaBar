use mongodb::{Client, Database, options::ClientOptions};
use std::env;
use anyhow::Result;

#[derive(Clone)]
pub struct DatabaseConfig {
    pub client: Client,
    pub database: Database,
}

impl DatabaseConfig {
    pub async fn new() -> Result<Self> {
        let mongodb_uri = env::var("MONGODB_URI")
            .unwrap_or_else(|_| "mongodb://localhost:27017/mabar".to_string());

        let mut client_options = ClientOptions::parse(&mongodb_uri).await?;
        
        // Configure connection pool settings
        client_options.max_pool_size = Some(10);
        client_options.min_pool_size = Some(1);
        client_options.max_idle_time = Some(std::time::Duration::from_secs(300));

        let client = Client::with_options(client_options)?;
        
        // Extract database name from URI or use default
        let db_name = extract_db_name(&mongodb_uri);
        let database = client.database(&db_name);

        // Test connection
        database.run_command(bson::doc! {"ping": 1}, None).await?;
        log::info!("MongoDB Connected: {}", mongodb_uri);

        Ok(DatabaseConfig { client, database })
    }

    pub fn get_database(&self) -> &Database {
        &self.database
    }
}

fn extract_db_name(uri: &str) -> String {
    if let Some(db_start) = uri.rfind('/') {
        let db_part = &uri[db_start + 1..];
        if let Some(query_start) = db_part.find('?') {
            db_part[..query_start].to_string()
        } else {
            db_part.to_string()
        }
    } else {
        "mabar".to_string()
    }
}