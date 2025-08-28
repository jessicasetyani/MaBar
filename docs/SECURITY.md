# Security Documentation

## Secure Secrets Management

### Overview
MaBar uses cryptographically secure secrets for JWT tokens and session management. These secrets are generated using OpenSSL and stored in environment variables.

### Generating Secure Secrets

#### Quick Start
```bash
npm run generate-secrets
```

#### Options
- `--dry-run`: Preview what would be generated without making changes
- `--force`: Force regeneration even if secure secrets exist
- `--help`: Show help message

#### Examples
```bash
# Generate secrets if needed (safe, won't overwrite existing secure secrets)
npm run generate-secrets

# Preview what would be generated
npm run generate-secrets -- --dry-run

# Force regeneration of new secrets
npm run generate-secrets -- --force
```

### Security Features

#### Secret Generation
- **JWT_SECRET**: 64 bytes (512 bits) of cryptographically secure random data
- **SESSION_SECRET**: 32 bytes (256 bits) of cryptographically secure random data
- Generated using OpenSSL's `rand -base64` command
- Meets industry standards for cryptographic strength

#### Safety Measures
- **Automatic Backup**: Creates timestamped backup before making changes
- **File Permissions**: Sets .env to 600 (owner read/write only)
- **Validation**: Checks secret length and complexity
- **Git Safety**: Validates .env is properly gitignored
- **No Overwrite**: Won't replace existing secure secrets without `--force`
- **Error Handling**: Graceful failure if OpenSSL is unavailable

### Production Deployment

#### Environment Variables Required
```bash
JWT_SECRET=<64-byte-base64-encoded-secret>
SESSION_SECRET=<32-byte-base64-encoded-secret>
```

#### Deployment Steps
1. Generate secrets locally: `npm run generate-secrets`
2. Copy the generated secrets from `.env`
3. Set them as environment variables in your production environment
4. Ensure `.env` is not deployed to production
5. Restart your application to use the new secrets

### Integration with Rust Backend

When migrating to Rust backend (Task #12), ensure:
- Rust application loads secrets from environment variables
- Use `dotenvy` crate for environment variable management
- Validate secrets at application startup
- Implement proper error handling for missing/invalid secrets