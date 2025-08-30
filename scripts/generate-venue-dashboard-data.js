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

async function generateVenueDashboardData() {
  try {
    console.log('🏟️ Generating venue dashboard test data...');

    // Create or get test venue owner user
    let venueUser;
    try {
      const user = new Parse.User();
      user.set('username', 'venue@mabar.com');
      user.set('email', 'venue@mabar.com');
      user.set('password', 'venue123');
      user.set('role', 'venue_owner');
      user.set('onboardingStatus', 'completed');
      
      venueUser = await user.signUp();
      console.log('✅ Test venue owner user created');
    } catch (error) {
      if (error.code === 202) {
        // User already exists, log in
        venueUser = await Parse.User.logIn('venue@mabar.com', 'venue123');
        console.log('✅ Test venue owner user logged in');
      } else {
        throw error;
      }
    }

    // Create or update VenueOwner profile
    const VenueOwner = Parse.Object.extend('VenueOwner');
    const venueQuery = new Parse.Query(VenueOwner);
    venueQuery.equalTo('user', venueUser);

    let venueOwner = await venueQuery.first();

    if (!venueOwner) {
      venueOwner = new VenueOwner();
      venueOwner.set('user', venueUser);
      console.log('📝 Creating new VenueOwner profile...');
    } else {
      console.log('📝 Updating existing VenueOwner profile...');
    }
    
    venueOwner.set('personalInfo', {
      name: 'Jakarta Padel Center',
      email: 'venue@mabar.com'
    });
    venueOwner.set('venueDetails', {
      name: 'Jakarta Padel Center',
      address: 'Jl. Sudirman No. 123, Jakarta Selatan',
      facilities: ['Indoor Courts', 'Outdoor Courts', 'Parking', 'Cafeteria', 'Pro Shop']
    });
    venueOwner.set('legalDocs', {
      nik: '3171234567890123',
      siup: 'JPC-SIUP-2024',
      phone: '+62 21 1234 5678'
    });
    venueOwner.set('status', 'approved');
    venueOwner.set('submittedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
    venueOwner.set('verifiedAt', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)); // 5 days ago

    const savedVenueOwner = await venueOwner.save();
    console.log('✅ VenueOwner profile created/updated with ID:', savedVenueOwner.id);
    console.log('🔗 Linked to user ID:', venueUser.id);

    // Generate booking data for the next 7 days
    const BookingClass = Parse.Object.extend('Booking');
    const bookings = [];
    
    const today = new Date();
    const playerNames = [
      ['John Doe', 'Mike Smith', 'Sarah Johnson', 'Lisa Brown'],
      ['Alex Chen', 'Maria Garcia', 'David Wilson', 'Emma Davis'],
      ['Carlos Rodriguez', 'Anna Kim', 'Tom Anderson', 'Sophie Martin'],
      ['Ryan Taylor', 'Jessica Lee', 'Mark Thompson', 'Nina Patel'],
      ['Lucas Silva', 'Olivia Wang', 'James Miller', 'Zoe Clark']
    ];
    
    const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4'];
    const statuses = ['confirmed', 'pending', 'confirmed', 'confirmed']; // More confirmed bookings
    const prices = [150000, 175000, 200000, 225000]; // Different price tiers
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      // Generate 3-5 bookings per day
      const bookingsPerDay = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < bookingsPerDay; i++) {
        const booking = new BookingClass();
        
        // Random time between 8 AM and 10 PM
        const startHour = Math.floor(Math.random() * 14) + 8; // 8-21
        const startMinute = Math.random() < 0.5 ? 0 : 30; // 0 or 30 minutes
        
        const startTime = new Date(currentDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1, startTime.getMinutes() + 30, 0, 0); // 1.5 hour sessions
        
        const players = playerNames[Math.floor(Math.random() * playerNames.length)];
        const court = courts[Math.floor(Math.random() * courts.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const price = prices[Math.floor(Math.random() * prices.length)];
        
        booking.set('venueId', savedVenueOwner.id);
        booking.set('title', `${court} - ${players[0]} & ${players[1]} vs ${players[2]} & ${players[3]}`);
        booking.set('startTime', startTime);
        booking.set('endTime', endTime);
        booking.set('court', court);
        booking.set('players', players);
        booking.set('status', status);
        booking.set('contact', `${players[0].toLowerCase().replace(' ', '.')}@email.com`);
        booking.set('phone', `+62 81${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`);
        booking.set('price', price);
        booking.set('paymentStatus', status === 'confirmed' ? 'paid' : 'pending');
        booking.set('createdAt', new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)); // Random time in last 24h
        
        bookings.push(booking);
      }
    }
    
    // Save all bookings
    const savedBookings = await Parse.Object.saveAll(bookings);
    console.log(`✅ Created ${savedBookings.length} test bookings`);

    // Generate some blocked slots
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot');
    const blockedSlots = [];
    
    // Block some maintenance slots
    for (let day = 1; day < 4; day++) {
      const blockDate = new Date(today);
      blockDate.setDate(today.getDate() + day);
      
      // Block early morning maintenance (6-8 AM)
      const maintenanceStart = new Date(blockDate);
      maintenanceStart.setHours(6, 0, 0, 0);
      
      const maintenanceEnd = new Date(blockDate);
      maintenanceEnd.setHours(8, 0, 0, 0);
      
      const blockedSlot = new BlockedSlotClass();
      blockedSlot.set('venueId', savedVenueOwner.id);
      blockedSlot.set('startTime', maintenanceStart);
      blockedSlot.set('endTime', maintenanceEnd);
      blockedSlot.set('reason', 'Maintenance');
      blockedSlot.set('createdBy', venueUser);
      
      blockedSlots.push(blockedSlot);
    }
    
    // Block some random slots for private events
    for (let i = 0; i < 3; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
      
      const eventStart = new Date(eventDate);
      eventStart.setHours(Math.floor(Math.random() * 6) + 14, 0, 0, 0); // 2-8 PM
      
      const eventEnd = new Date(eventStart);
      eventEnd.setHours(eventStart.getHours() + 2, 0, 0, 0); // 2 hour blocks
      
      const blockedSlot = new BlockedSlotClass();
      blockedSlot.set('venueId', savedVenueOwner.id);
      blockedSlot.set('startTime', eventStart);
      blockedSlot.set('endTime', eventEnd);
      blockedSlot.set('reason', 'Private Event');
      blockedSlot.set('createdBy', venueUser);
      
      blockedSlots.push(blockedSlot);
    }
    
    const savedBlockedSlots = await Parse.Object.saveAll(blockedSlots);
    console.log(`✅ Created ${savedBlockedSlots.length} blocked time slots`);

    console.log('\n🎉 Venue dashboard test data generated successfully!');
    console.log('\n📋 Summary:');
    console.log(`   👤 Venue Owner: venue@mabar.com (password: venue123)`);
    console.log(`   🏟️ Venue: Jakarta Padel Center`);
    console.log(`   📅 Bookings: ${savedBookings.length} bookings over 7 days`);
    console.log(`   🚫 Blocked Slots: ${savedBlockedSlots.length} maintenance/event blocks`);
    console.log(`   ✅ Status: Approved venue ready for dashboard`);
    
    console.log('\n🚀 To view the dashboard:');
    console.log('   1. Start the frontend: npm run dev');
    console.log('   2. Go to http://localhost:5173');
    console.log('   3. Login with: venue@mabar.com / venue123');
    console.log('   4. You should be redirected to the venue dashboard');
    
  } catch (error) {
    console.error('❌ Failed to generate test data:', error);
    process.exit(1);
  }
}

// Clean up existing test data first
async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up existing test data...');
    
    // Delete existing bookings for test venue
    const BookingClass = Parse.Object.extend('Booking');
    const bookingQuery = new Parse.Query(BookingClass);
    const existingBookings = await bookingQuery.find();
    if (existingBookings.length > 0) {
      await Parse.Object.destroyAll(existingBookings);
      console.log(`✅ Deleted ${existingBookings.length} existing bookings`);
    }
    
    // Delete existing blocked slots
    const BlockedSlotClass = Parse.Object.extend('BlockedSlot');
    const blockedQuery = new Parse.Query(BlockedSlotClass);
    const existingBlocked = await blockedQuery.find();
    if (existingBlocked.length > 0) {
      await Parse.Object.destroyAll(existingBlocked);
      console.log(`✅ Deleted ${existingBlocked.length} existing blocked slots`);
    }
    
  } catch (error) {
    console.log('⚠️ Cleanup warning (this is normal for first run):', error.message);
  }
}

// Main execution
async function main() {
  await cleanupTestData();
  await generateVenueDashboardData();
  console.log('✅ Script completed successfully');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
