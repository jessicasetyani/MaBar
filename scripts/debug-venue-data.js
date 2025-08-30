#!/usr/bin/env node

const Parse = require('parse/node');
require('dotenv').config();

// Initialize Parse
Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function debugVenueData() {
  try {
    console.log('🔍 Debugging venue data...\n');

    // Check if test user exists
    console.log('1. Checking test user...');
    try {
      const user = await Parse.User.logIn('venue@mabar.com', 'venue123');
      console.log('✅ Test user found:', {
        id: user.id,
        email: user.get('email'),
        role: user.get('role'),
        onboardingStatus: user.get('onboardingStatus')
      });
    } catch (error) {
      console.log('❌ Test user not found:', error.message);
      return;
    }

    // Check VenueOwner profile
    console.log('\n2. Checking VenueOwner profile...');
    const VenueOwner = Parse.Object.extend('VenueOwner');
    const venueQuery = new Parse.Query(VenueOwner);
    venueQuery.equalTo('user', Parse.User.current());

    const venueOwner = await venueQuery.first();
    if (venueOwner) {
      console.log('✅ VenueOwner profile found:', {
        id: venueOwner.id,
        status: venueOwner.get('status'),
        venueName: venueOwner.get('venueDetails')?.name,
        submittedAt: venueOwner.get('submittedAt')
      });
    } else {
      console.log('❌ VenueOwner profile not found for current user');

      // Check all VenueOwner profiles
      console.log('\n2b. Checking ALL VenueOwner profiles...');
      const allVenueQuery = new Parse.Query(VenueOwner);
      const allVenues = await allVenueQuery.find();
      console.log(`📊 Total VenueOwner profiles: ${allVenues.length}`);

      if (allVenues.length > 0) {
        allVenues.forEach((venue, index) => {
          const user = venue.get('user');
          console.log(`   ${index + 1}. VenueOwner ID: ${venue.id}`);
          console.log(`      User ID: ${user ? user.id : 'null'}`);
          console.log(`      Status: ${venue.get('status')}`);
          console.log(`      Venue Name: ${venue.get('venueDetails')?.name}`);
        });
      }
      return;
    }

    // Check bookings for this venue
    console.log('\n3. Checking bookings...');
    const BookingClass = Parse.Object.extend('Booking');
    const bookingQuery = new Parse.Query(BookingClass);
    bookingQuery.equalTo('venueId', venueOwner.id);
    
    const bookings = await bookingQuery.find();
    console.log(`✅ Found ${bookings.length} bookings for venue ${venueOwner.id}`);
    
    if (bookings.length > 0) {
      console.log('📅 Sample booking:', {
        id: bookings[0].id,
        title: bookings[0].get('title'),
        startTime: bookings[0].get('startTime'),
        endTime: bookings[0].get('endTime'),
        court: bookings[0].get('court'),
        status: bookings[0].get('status')
      });
    }

    // Check blocked slots
    console.log('\n4. Checking blocked slots...');
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot');
    const blockedQuery = new Parse.Query(BlockedSlotClass);
    blockedQuery.equalTo('venueId', venueOwner.id);
    
    const blockedSlots = await blockedQuery.find();
    console.log(`✅ Found ${blockedSlots.length} blocked slots for venue ${venueOwner.id}`);
    
    if (blockedSlots.length > 0) {
      console.log('🚫 Sample blocked slot:', {
        id: blockedSlots[0].id,
        startTime: blockedSlots[0].get('startTime'),
        endTime: blockedSlots[0].get('endTime'),
        reason: blockedSlots[0].get('reason')
      });
    }

    // Check all bookings (debug)
    console.log('\n5. Checking ALL bookings in database...');
    const allBookingsQuery = new Parse.Query(BookingClass);
    const allBookings = await allBookingsQuery.find();
    console.log(`📊 Total bookings in database: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('🔍 Venue IDs in bookings:');
      const venueIds = [...new Set(allBookings.map(b => b.get('venueId')))];
      venueIds.forEach(id => {
        const count = allBookings.filter(b => b.get('venueId') === id).length;
        console.log(`   - ${id}: ${count} bookings`);
      });
    }

    console.log('\n🎯 Summary:');
    console.log(`   Current venue ID: ${venueOwner.id}`);
    console.log(`   Bookings for this venue: ${bookings.length}`);
    console.log(`   Blocked slots for this venue: ${blockedSlots.length}`);
    
    if (bookings.length === 0) {
      console.log('\n⚠️  No bookings found for current venue!');
      console.log('   This might be why the dashboard shows no data.');
      console.log('   Try running: npm run db:demo-data');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugVenueData().then(() => {
  console.log('\n✅ Debug complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
