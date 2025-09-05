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

async function validateDatabase() {
  try {
    console.log('🔍 Validating MaBar database contents...\n');

    // Check Users
    console.log('👥 USERS:');
    const userQuery = new Parse.Query(Parse.User);
    const users = await userQuery.find({ useMasterKey: true });
    console.log(`   Total users: ${users.length}`);
    
    users.forEach(user => {
      console.log(`   - ${user.get('email')} (${user.get('role')}) - ${user.get('onboardingStatus')}`);
    });

    // Check VenueOwners
    console.log('\n🏟️ VENUE OWNERS:');
    const VenueOwner = Parse.Object.extend('VenueOwner');
    const venueQuery = new Parse.Query(VenueOwner);
    const venues = await venueQuery.find({ useMasterKey: true });
    console.log(`   Total venues: ${venues.length}`);
    
    venues.forEach(venue => {
      const details = venue.get('venueDetails') || {};
      console.log(`   - ${details.name} (${venue.get('status')}) - ID: ${venue.id}`);
    });

    // Check PlayerProfiles
    console.log('\n👤 PLAYER PROFILES:');
    const PlayerProfile = Parse.Object.extend('PlayerProfile');
    const profileQuery = new Parse.Query(PlayerProfile);
    const profiles = await profileQuery.find({ useMasterKey: true });
    console.log(`   Total player profiles: ${profiles.length}`);
    
    profiles.forEach(profile => {
      const info = profile.get('personalInfo') || {};
      console.log(`   - ${info.name} (${profile.get('skillLevel')}) - ${info.email}`);
    });

    // Check Bookings
    console.log('\n📅 BOOKINGS:');
    const BookingClass = Parse.Object.extend('Booking');
    const bookingQuery = new Parse.Query(BookingClass);
    bookingQuery.limit(1000);
    const bookings = await bookingQuery.find({ useMasterKey: true });
    console.log(`   Total bookings: ${bookings.length}`);
    
    // Group by status
    const statusCounts = {};
    bookings.forEach(booking => {
      const status = booking.get('status');
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} bookings`);
    });

    // Show sample bookings
    console.log('\n   Sample bookings:');
    bookings.slice(0, 3).forEach(booking => {
      const startTime = booking.get('startTime');
      console.log(`   - ${booking.get('title')} (${startTime ? startTime.toLocaleDateString() : 'No date'})`);
    });

    // Check BlockedSlots
    console.log('\n🚫 BLOCKED SLOTS:');
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot');
    const blockedQuery = new Parse.Query(BlockedSlotClass);
    const blockedSlots = await blockedQuery.find({ useMasterKey: true });
    console.log(`   Total blocked slots: ${blockedSlots.length}`);
    
    blockedSlots.forEach(slot => {
      console.log(`   - ${slot.get('reason')} (${slot.get('startTime')?.toLocaleDateString()})`);
    });

    // Check Sessions
    console.log('\n🎮 SESSIONS:');
    const SessionClass = Parse.Object.extend('Session');
    const sessionQuery = new Parse.Query(SessionClass);
    const sessions = await sessionQuery.find({ useMasterKey: true });
    console.log(`   Total sessions: ${sessions.length}`);

    console.log('\n📊 SUMMARY:');
    console.log(`   Users: ${users.length} (${users.filter(u => u.get('role') === 'venue_owner').length} venues, ${users.filter(u => u.get('role') === 'player').length} players)`);
    console.log(`   Venues: ${venues.length} (${venues.filter(v => v.get('status') === 'approved').length} approved)`);
    console.log(`   Player Profiles: ${profiles.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Blocked Slots: ${blockedSlots.length}`);
    console.log(`   Sessions: ${sessions.length}`);

    // Validation status
    console.log('\n✅ VALIDATION RESULTS:');
    if (venues.length > 0) console.log('   ✅ Venues exist');
    if (bookings.length > 0) console.log('   ✅ Bookings exist');
    if (profiles.length > 0) console.log('   ✅ Player profiles exist');
    if (venues.length === 0) console.log('   ❌ No venues found');
    if (bookings.length === 0) console.log('   ❌ No bookings found');
    if (profiles.length === 0) console.log('   ⚠️ No player profiles found');

    console.log('\n🚀 Ready for AI matching development!');

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

validateDatabase().then(() => {
  console.log('\n✅ Database validation completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});