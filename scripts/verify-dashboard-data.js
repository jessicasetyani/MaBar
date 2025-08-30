#!/usr/bin/env node

const Parse = require('parse/node');
require('dotenv').config();

// Validate required environment variables
const missing = [];
if (!process.env.VITE_BACK4APP_APP_ID) missing.push('VITE_BACK4APP_APP_ID');
if (!process.env.VITE_BACK4APP_JAVASCRIPT_KEY) missing.push('VITE_BACK4APP_JAVASCRIPT_KEY');
if (!process.env.VITE_BACK4APP_MASTER_KEY) missing.push('VITE_BACK4APP_MASTER_KEY');
const venueId = process.env.VENUE_OWNER_ID || 'Ivej8c3bJ7';
if (!process.env.VENUE_OWNER_ID) {
  console.warn('⚠️  VENUE_OWNER_ID not set, using fallback ID');
}
if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Initialize Parse
Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function verifyDashboardData() {
  try {
    console.log('🔍 Verifying dashboard data for venue@mabar.com...\n');

    // Get the specific VenueOwner profile we know exists
    const VenueOwner = Parse.Object.extend('VenueOwner');
    const venueQuery = new Parse.Query(VenueOwner);
    const venueOwner = await venueQuery.get(venueId, { useMasterKey: true });
    
    console.log('✅ VenueOwner profile verified:', {
      id: venueOwner.id,
      status: venueOwner.get('status'),
      venueName: venueOwner.get('venueDetails')?.name,
      userLinked: venueOwner.get('user') ? 'Yes' : 'No'
    });

    // Check bookings for this specific venue
    const BookingClass = Parse.Object.extend('Booking');
    const bookingQuery = new Parse.Query(BookingClass);
    bookingQuery.equalTo('venueId', venueOwner.id);
    
    const bookings = await bookingQuery.find({ useMasterKey: true });
    console.log(`\n📅 Bookings for venue ${venueOwner.id}: ${bookings.length}`);
    
    if (bookings.length > 0) {
      console.log('\n📋 Sample bookings:');
      bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.get('title')}`);
        console.log(`      Time: ${booking.get('startTime')} - ${booking.get('endTime')}`);
        console.log(`      Court: ${booking.get('court')}`);
        console.log(`      Status: ${booking.get('status')}`);
      });
    }

    // Check blocked slots
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot');
    const blockedQuery = new Parse.Query(BlockedSlotClass);
    blockedQuery.equalTo('venueId', venueOwner.id);
    
    const blockedSlots = await blockedQuery.find({ useMasterKey: true });
    console.log(`\n🚫 Blocked slots for venue ${venueOwner.id}: ${blockedSlots.length}`);

    console.log('\n🎯 Dashboard Data Summary:');
    console.log(`   ✅ Venue Profile: Found (ID: ${venueOwner.id})`);
    console.log(`   ✅ Status: ${venueOwner.get('status')}`);
    console.log(`   ✅ Bookings: ${bookings.length} events`);
    console.log(`   ✅ Blocked Slots: ${blockedSlots.length} blocks`);
    
    console.log('\n🚀 Dashboard should now show:');
    console.log('   📅 Calendar with booking events');
    console.log('   🟢 Green confirmed bookings');
    console.log('   🟡 Yellow pending bookings');
    console.log('   🔴 Red blocked time slots');
    console.log('   🖱️  Clickable events for details');
    
    console.log('\n💡 To test:');
    console.log('   1. Login with: venue@mabar.com / venue123');
    console.log('   2. Should redirect to venue dashboard');
    console.log('   3. Calendar tab should show booking data');
    console.log('   4. Click events to see booking details');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

verifyDashboardData().then(() => {
  console.log('\n✅ Verification complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
