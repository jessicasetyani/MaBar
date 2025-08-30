#!/usr/bin/env node

/**
 * Back4App Schema Setup Script
 * Creates necessary classes and schemas for MaBar application
 */

const Parse = require('parse/node');
require('dotenv').config();

// Initialize Parse
Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function setupSchema() {
  console.log('🔄 Setting up Back4App schema for MaBar...');

  try {
    // Create VenueOwner class schema
    const VenueOwnerSchema = new Parse.Schema('VenueOwner');
    
    // Add fields
    VenueOwnerSchema.addPointer('user', '_User');
    VenueOwnerSchema.addObject('personalInfo');
    VenueOwnerSchema.addObject('venueDetails');
    VenueOwnerSchema.addObject('legalDocs');
    VenueOwnerSchema.addArray('documents');
    VenueOwnerSchema.addString('status', { defaultValue: 'pending_verification' });
    VenueOwnerSchema.addDate('submittedAt');
    VenueOwnerSchema.addDate('verifiedAt');
    VenueOwnerSchema.addString('verificationNotes');

    // Set permissions
    VenueOwnerSchema.setCLP({
      find: { '*': true },
      get: { '*': true },
      create: { requiresAuthentication: true },
      update: { requiresAuthentication: true },
      delete: { requiresAuthentication: true }
    });

    await VenueOwnerSchema.save();
    console.log('✅ VenueOwner schema created');

    // Create Venue class schema
    const VenueSchema = new Parse.Schema('Venue');
    
    VenueSchema.addPointer('owner', 'VenueOwner');
    VenueSchema.addString('name');
    VenueSchema.addString('description');
    VenueSchema.addObject('address');
    VenueSchema.addGeoPoint('location');
    VenueSchema.addArray('facilities');
    VenueSchema.addArray('images');
    VenueSchema.addObject('pricing');
    VenueSchema.addObject('operatingHours');
    VenueSchema.addNumber('courtCount', { defaultValue: 1 });
    VenueSchema.addBoolean('isActive', { defaultValue: true });
    VenueSchema.addNumber('rating', { defaultValue: 0 });
    VenueSchema.addNumber('reviewCount', { defaultValue: 0 });

    VenueSchema.setCLP({
      find: { '*': true },
      get: { '*': true },
      create: { requiresAuthentication: true },
      update: { requiresAuthentication: true },
      delete: { requiresAuthentication: true }
    });

    await VenueSchema.save();
    console.log('✅ Venue schema created');

    // Create PlayerProfile class schema
    const PlayerProfileSchema = new Parse.Schema('PlayerProfile');
    
    PlayerProfileSchema.addPointer('user', '_User');
    PlayerProfileSchema.addString('skillLevel');
    PlayerProfileSchema.addArray('preferredTimes');
    PlayerProfileSchema.addArray('preferredLocations');
    PlayerProfileSchema.addString('playingStyle');
    PlayerProfileSchema.addObject('preferences');
    PlayerProfileSchema.addNumber('gamesPlayed', { defaultValue: 0 });
    PlayerProfileSchema.addNumber('rating', { defaultValue: 0 });

    PlayerProfileSchema.setCLP({
      find: { '*': true },
      get: { '*': true },
      create: { requiresAuthentication: true },
      update: { requiresAuthentication: true },
      delete: { requiresAuthentication: true }
    });

    await PlayerProfileSchema.save();
    console.log('✅ PlayerProfile schema created');

    // Update _User class to add custom fields
    const UserSchema = new Parse.Schema('_User');
    UserSchema.addString('role');
    UserSchema.addString('onboardingStatus');
    UserSchema.addString('firstName');
    UserSchema.addString('lastName');
    UserSchema.addString('phone');
    
    await UserSchema.update();
    console.log('✅ _User schema updated');

    console.log('\n🎉 Back4App schema setup completed successfully!');
    
  } catch (error) {
    if (error.code === 103) {
      console.log('ℹ️  Schema already exists, skipping...');
    } else {
      console.error('❌ Schema setup failed:', error);
      process.exit(1);
    }
  }
}

// Run the setup
setupSchema().then(() => {
  console.log('✅ Schema setup complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});