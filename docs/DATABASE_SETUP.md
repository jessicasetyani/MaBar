# Database Setup Guide

This guide explains how to set up the Back4App database schema for the MaBar application.

## Prerequisites

1. Back4App account with an app created
2. Environment variables configured in `.env` file
3. Node.js and npm installed

## Environment Configuration

Make sure your `.env` file contains the following Back4App credentials:

```env
VITE_BACK4APP_APP_ID="your_back4app_app_id_here"
VITE_BACK4APP_JAVASCRIPT_KEY="your_back4app_javascript_key_here"
VITE_BACK4APP_MASTER_KEY="your_back4app_master_key_here"
```

## Database Schema Setup

Run the schema setup script to create the necessary classes and fields in Back4App:

```bash
npm run db:schema
```

This script will create the following classes:

### VenueOwner Class

- `user` (Pointer to \_User)
- `personalInfo` (Object)
- `venueDetails` (Object)
- `legalDocs` (Object)
- `documents` (Array)
- `status` (String, default: "pending_verification")
- `submittedAt` (Date)
- `verifiedAt` (Date)
- `verificationNotes` (String)

### Venue Class

- `owner` (Pointer to VenueOwner)
- `name` (String)
- `description` (String)
- `address` (Object)
- `location` (GeoPoint)
- `facilities` (Array)
- `images` (Array)
- `pricing` (Object)
- `operatingHours` (Object)
- `courtCount` (Number, default: 1)
- `isActive` (Boolean, default: true)
- `rating` (Number, default: 0)
- `reviewCount` (Number, default: 0)

### PlayerProfile Class

- `user` (Pointer to \_User)
- `skillLevel` (String)
- `preferredTimes` (Array)
- `preferredLocations` (Array)
- `playingStyle` (String)
- `preferences` (Object)
- `gamesPlayed` (Number, default: 0)
- `rating` (Number, default: 0)

### \_User Class Updates

- `role` (String)
- `onboardingStatus` (String)
- `firstName` (String)
- `lastName` (String)
- `phone` (String)

## Troubleshooting

### Schema Already Exists Error

If you see "Schema already exists" messages, this is normal and means the classes were already created.

### Permission Errors

Make sure your Master Key is correctly set in the environment variables and has the necessary permissions.

### Connection Issues

Verify your App ID and JavaScript Key are correct and that your Back4App app is active.

## Data Structure Examples

### VenueOwner personalInfo Object

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### VenueOwner venueDetails Object

```json
{
  "name": "Jakarta Padel Center",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "facilities": ["Indoor Courts", "Parking", "Cafeteria"]
}
```

### VenueOwner legalDocs Object

```json
{
  "nik": "1234567890123456",
  "siup": "SIUP-123456789",
  "phone": "+62812345678"
}
```

### VenueOwner documents Array

```json
[
  {
    "name": "ktp.pdf",
    "url": "https://files.back4app.com/...",
    "type": "application/pdf"
  }
]
```

## Security Considerations

- Master Key should only be used for administrative operations
- Client applications should use JavaScript Key only
- Implement proper Class Level Permissions (CLP) for production
- Validate all user inputs before saving to database
