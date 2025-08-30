# Back4App Cloud Functions Deployment Guide

## Overview
This directory contains Back4App Cloud Functions for MaBar's Gemini API integration.

## Files
- `main.js` - Main Cloud Function with Gemini API integration
- `package.json` - Dependencies for Cloud Functions

## Deployment Steps

### 1. Install Back4App CLI
```bash
npm install -g back4app-cli
```

### 2. Login to Back4App
```bash
b4a login
```

### 3. Deploy Cloud Functions
```bash
# From the project root
b4a deploy cloud/
```

### 4. Set Environment Variables in Back4App Dashboard
1. Go to your Back4App app dashboard
2. Navigate to Server Settings > Environment Variables
3. Add the following environment variable:
   - `GEMINI_API_KEY`: Your Google Gemini API key

## Cloud Functions

### getMatchmakingRecommendations
**Purpose**: Get AI-powered matchmaking recommendations using Gemini API

**Parameters**:
- `query` (string): User's matchmaking query
- `userProfile` (object): User profile data
- `language` (string, optional): 'en' or 'id' (default: 'en')

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [...],
    "reasoning": "...",
    "confidence_score": 0.8
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "language": "en"
}
```

### healthCheck
**Purpose**: Check if Cloud Functions are running properly

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Rate Limiting
- 10 requests per minute per user
- Applies to `getMatchmakingRecommendations` function

## Error Handling
- Input validation
- API timeout handling (30 seconds)
- Structured error responses
- Logging for debugging

## Testing
Use the frontend GeminiService to test the Cloud Functions:

```typescript
import { GeminiService } from '@/services/gemini'

// Test matchmaking recommendations
const result = await GeminiService.getMatchmakingRecommendations(
  "Find me a padel partner for tomorrow evening",
  {
    skillLevel: 'intermediate',
    location: 'Jakarta',
    preferredTime: 'evening'
  },
  'en'
)

// Test health check
const health = await GeminiService.healthCheck()
```