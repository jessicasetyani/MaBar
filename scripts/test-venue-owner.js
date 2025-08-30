#!/usr/bin/env node

const Parse = require('parse/node');
require('dotenv').config();

// Environment variables with server-side priority and fallbacks
const appId = process.env.BACK4APP_APP_ID || process.env.VITE_BACK4APP_APP_ID;
const jsKey = process.env.BACK4APP_JAVASCRIPT_KEY || process.env.VITE_BACK4APP_JAVASCRIPT_KEY;
const masterKey = process.env.BACK4APP_MASTER_KEY || process.env.VITE_BACK4APP_MASTER_KEY;

// Validate required credentials
if (!appId) {
  console.error('❌ Missing BACK4APP_APP_ID or VITE_BACK4APP_APP_ID');
  process.exit(1);
}
if (!jsKey) {
  console.error('❌ Missing BACK4APP_JAVASCRIPT_KEY or VITE_BACK4APP_JAVASCRIPT_KEY');
  process.exit(1);
}
if (!masterKey) {
  console.error('❌ Missing BACK4APP_MASTER_KEY (required for this script)');
  process.exit(1);
}

// Initialize Parse
Parse.initialize(appId, jsKey, masterKey);
Parse.serverURL = 'https://parseapi.back4app.com';

async function testVenueOwner() {
  try {
    console.log('🧪 Testing VenueOwner class...');

    // Create a test user first
    const user = new Parse.User();
    user.set('username', 'test@venue.com');
    user.set('email', 'test@venue.com');
    user.set('password', 'testpass123');
    user.set('role', 'venue_owner');
    
    let savedUser;
    try {
      savedUser = await user.signUp();
      console.log('✅ Test user created');
    } catch (error) {
      if (error.code === 202 || error.code === 203) {
        // User already exists, try to log in
        savedUser = await Parse.User.logIn('test@venue.com', 'testpass123');
        console.log('✅ Test user logged in');
      } else {
        throw error;
      }
    }

    // Create VenueOwner
    const VenueOwner = Parse.Object.extend('VenueOwner');
    const venueOwner = new VenueOwner();
    
    venueOwner.set('user', savedUser);
    venueOwner.set('personalInfo', {
      name: 'Test Owner',
      email: 'test@venue.com'
    });
    venueOwner.set('venueDetails', {
      name: 'Test Venue',
      address: 'Test Address',
      facilities: ['Indoor Courts', 'Parking']
    });
    venueOwner.set('legalDocs', {
      nik: '1234567890123456',
      siup: 'TEST-SIUP-123',
      phone: '+6281234567890'
    });
    venueOwner.set('status', 'pending_verification');
    venueOwner.set('submittedAt', new Date());

    const savedVenueOwner = await venueOwner.save();
    console.log('✅ VenueOwner created with ID:', savedVenueOwner.id);

    // Query it back
    const query = new Parse.Query(VenueOwner);
    query.equalTo('user', savedUser);
    const retrieved = await query.first();
    
    if (retrieved) {
      console.log('✅ VenueOwner retrieved successfully');
      console.log('📋 Data:', {
        personalInfo: retrieved.get('personalInfo'),
        venueDetails: retrieved.get('venueDetails'),
        status: retrieved.get('status')
      });
    }

    // Clean up
    await retrieved.destroy();
    await savedUser.destroy({ useMasterKey: true });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 VenueOwner class test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testVenueOwner().then(() => {
  console.log('✅ Test complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});