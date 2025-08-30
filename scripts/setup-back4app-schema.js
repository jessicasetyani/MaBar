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
    // Test connection first
    const TestObject = Parse.Object.extend('TestConnection');
    const testObj = new TestObject();
    testObj.set('test', 'connection');
    await testObj.save();
    await testObj.destroy();
    console.log('✅ Back4App connection verified');
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

    try {
      await VenueOwnerSchema.save();
      console.log('✅ VenueOwner schema created');
    } catch (error) {
      if (error.code === 103) {
        console.log('ℹ️  VenueOwner schema already exists');
      } else {
        console.error('❌ VenueOwner schema error:', error);
        throw error;
      }
    }

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

    try {
      await VenueSchema.save();
      console.log('✅ Venue schema created');
    } catch (error) {
      if (error.code === 103) {
        console.log('ℹ️  Venue schema already exists');
      } else {
        console.error('❌ Venue schema error:', error);
        throw error;
      }
    }

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

    try {
      await PlayerProfileSchema.save();
      console.log('✅ PlayerProfile schema created');
    } catch (error) {
      if (error.code === 103) {
        console.log('ℹ️  PlayerProfile schema already exists');
      } else {
        console.error('❌ PlayerProfile schema error:', error);
        throw error;
      }
    }

    // Update _User class to add custom fields
    const UserSchema = new Parse.Schema('_User');
    UserSchema.addString('role');
    UserSchema.addString('onboardingStatus');
    UserSchema.addString('firstName');
    UserSchema.addString('lastName');
    UserSchema.addString('phone');
    
    try {
      await UserSchema.update();
      console.log('✅ _User schema updated');
    } catch (error) {
      if (error.code === 103) {
        console.log('ℹ️  _User schema already exists');
      } else {
        console.error('❌ _User schema error:', error);
        throw error;
      }
    }

    console.log('\n🎉 Back4App schema setup completed successfully!');
    console.log('📝 Classes created: VenueOwner, Venue, PlayerProfile, _User (updated)');
    console.log('\n🔍 Check your Back4App dashboard to verify the classes were created');
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error);
    process.exit(1);
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