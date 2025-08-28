# MaBar Rust Backend

High-performance Rust backend for the MaBar Padel matchmaking platform using Actix Web framework.

## Project Structure

```
src/
├── bin/           # Binary entry points
├── config/        # Configuration modules (database, etc.)
├── controllers/   # Request handlers
├── middleware/    # Custom middleware (auth, security, etc.)
├── models/        # Data models and schemas
├── routes/        # Route definitions
├── services/      # Business logic services
└── utils/         # Utility functions
```

## Dependencies

- **actix-web**: Web framework
- **mongodb**: Database driver
- **serde**: Serialization/deserialization
- **jsonwebtoken**: JWT authentication
- **oauth2**: OAuth2 integration
- **bcrypt**: Password hashing
- **dotenv**: Environment configuration

## Development

```bash
# Build the project
cargo build

# Run in development mode
cargo run

# Run tests
cargo test
```

## Migration Status

This is a migration from the existing Node.js/Express.js backend. Current status:

- ✅ Project structure and dependencies setup
- 🔄 Database configuration (next)
- ⏳ Models migration
- ⏳ Authentication middleware
- ⏳ Routes migration
- ⏳ Testing and deployment