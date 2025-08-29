# MaBar Centralized Configuration Guide

## Overview

This guide documents the centralized configuration system implemented in MaBar. All environment variables are now managed through a single root `.env` file, eliminating duplication and ensuring consistent configuration across frontend and backend components.

## Configuration Architecture

### Single Source of Truth

- **Root `.env` file**: Contains all environment variables for both frontend and backend
- **No duplicate files**: Removed `backend-rust/.env` and `frontend/.env` to prevent confusion
- **Centralized management**: All configuration changes happen in one place

### How It Works

1. **Backend (Rust)**: Loads environment variables from `../.env` (root directory)
2. **Frontend (Vite)**: Configured to load environment variables from parent directory
3. **Consistent ports**: Frontend runs on 5173, Backend runs on 5000
4. **Environment variable prefixes**: Frontend uses `VITE_` prefixed variables

## Environment Variables

### Core Configuration Variables

```env
# Backend Configuration
BACKEND_PORT=5000
BACKEND_HOST=127.0.0.1
BACKEND_BASE_URL=http://localhost

# Frontend Configuration
FRONTEND_PORT=5173
FRONTEND_HOST=0.0.0.0
FRONTEND_BASE_URL=http://localhost

# Legacy PORT variable for compatibility
PORT=5000
```

### Variable Descriptions

- **BACKEND_PORT**: Port number for the Rust backend server (default: 5000)
- **BACKEND_HOST**: Host address for the backend server (default: 127.0.0.1)
- **BACKEND_URL**: Complete backend URL used by frontend for API calls
- **FRONTEND_PORT**: Port number for the Vite development server (default: 5173)
- **FRONTEND_HOST**: Host address for the frontend server (default: 0.0.0.0)
- **FRONTEND_URL**: Complete frontend URL used by backend for CORS configuration
- **PORT**: Legacy variable maintained for backward compatibility

## Implementation Details

### Backend Changes (Rust)

1. **Main Server Configuration** (`backend-rust/src/main.rs`):
   - Uses `BACKEND_PORT` or falls back to `PORT` environment variable
   - Uses `BACKEND_HOST` for bind address configuration
   - CORS configuration uses `FRONTEND_URL` environment variable

2. **Environment Configuration** (`backend-rust/src/config/environment.rs`):
   - Production and development configs use environment variables
   - Fallback values ensure system works without explicit configuration
   - Port configuration prioritizes `BACKEND_PORT` over legacy `PORT`

### Frontend Changes (React/Vite)

1. **Vite Configuration** (`frontend/vite.config.js`):
   - Development server port uses `FRONTEND_PORT` environment variable
   - Proxy configuration uses `BACKEND_URL` for API routing
   - Environment variables exposed to frontend via `define` configuration

2. **API Calls** (All frontend components):
   - All hardcoded API URLs replaced with `import.meta.env.VITE_API_BASE_URL`
   - Fallback to empty string for relative URLs when environment variable not set
   - Consistent pattern across all fetch calls

### Environment Variable Exposure

The Vite configuration automatically exposes these variables to the frontend:
- `VITE_API_BASE_URL`: Set to `BACKEND_URL` value
- `VITE_FRONTEND_URL`: Set to `FRONTEND_URL` value

## Development vs Production

### Development Configuration
```env
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Production Configuration
```env
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## Migration Benefits

1. **Centralized Configuration**: All URLs managed in single `.env` file
2. **Environment Flexibility**: Easy switching between development/staging/production
3. **Port Consistency**: Standardized ports (5000 for backend, 5173 for frontend)
4. **Deployment Ready**: Production URLs easily configurable
5. **Developer Experience**: No hardcoded URLs to update when changing ports

## Usage Examples

### Starting Development Servers

```bash
# Backend (will use BACKEND_PORT=5000)
cd backend-rust
cargo run

# Frontend (will use FRONTEND_PORT=5173)
cd frontend
npm run dev
```

### Changing Ports

Simply update the `.env` file:
```env
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Production Deployment

Update `.env` for production:
```env
BACKEND_URL=https://api.mabar.com
FRONTEND_URL=https://mabar.com
BACKEND_PORT=5000
FRONTEND_PORT=5173
```

## Troubleshooting

### Common Issues

1. **API calls failing**: Ensure `VITE_API_BASE_URL` is properly set in Vite config
2. **CORS errors**: Verify `FRONTEND_URL` matches your frontend domain
3. **Port conflicts**: Check if ports specified in environment variables are available

### Verification

Test the configuration:
```bash
# Check backend is running on correct port
curl http://localhost:${BACKEND_PORT}/api/health

# Check frontend is accessible
curl http://localhost:${FRONTEND_PORT}
```

## Files Modified

- `.env` - Added centralized URL configuration
- `frontend/vite.config.js` - Environment variable integration
- `backend-rust/src/main.rs` - Port and host configuration
- `backend-rust/src/config/environment.rs` - Environment variable usage
- All frontend components with API calls - Environment variable references
- `README.md` and `backend-rust/README.md` - Updated documentation
