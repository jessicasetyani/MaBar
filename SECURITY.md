# Security Configuration

## Environment Variables Setup

### Backend (.env)
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)

# Add to backend/.env
JWT_SECRET=your_generated_jwt_secret
SESSION_SECRET=your_generated_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:5000
```

## CSRF Protection

CSRF tokens are required for all API requests. Get token from `/auth/csrf-token` and include in requests as:
- Header: `X-CSRF-Token: <token>`
- Body: `_csrf: <token>`

## Production Checklist

- [ ] Use HTTPS only
- [ ] Set secure environment variables
- [ ] Enable CSRF protection
- [ ] Configure proper CORS
- [ ] Use secure session cookies
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Use secrets management service

## Security Headers

The application includes:
- Helmet.js for security headers
- CORS protection
- Rate limiting
- Secure cookie configuration
- CSRF protection