const Parse = require('parse/node');
require('dotenv').config();

// Initialize Parse
Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
);
Parse.serverURL = 'https://parseapi.back4app.com';
Parse.masterKey = process.env.VITE_BACK4APP_MASTER_KEY;

const seedComprehensiveTestData = async () => {
  try {
    console.log('🌱 Seeding comprehensive test data for MaBar AI Chat...');
    Parse.Cloud.useMasterKey();

    // Clear existing test data
    await clearExistingData();

    // Seed data in order
    const venues = await seedVenues();
    const players = await seedPlayers();
    const sessions = await seedSessions(venues, players);
    await seedBookings(sessions, players);
    await seedAnalytics();

    console.log('🎉 Comprehensive test data seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${venues.length} venues created`);
    console.log(`   - ${players.length} players created`);
    console.log(`   - ${sessions.length} sessions created`);
    console.log('   - Booking history and analytics added');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

const clearExistingData = async () => {
  console.log('🧹 Clearing existing test data...');
  
  const collections = ['Venue', 'PlayerProfile', 'Session', 'Booking', 'Analytics'];
  
  for (const collection of collections) {
    try {
      const query = new Parse.Query(collection);
      const objects = await query.find();
      if (objects.length > 0) {
        await Parse.Object.destroyAll(objects);
        console.log(`   - Cleared ${objects.length} ${collection} records`);
      }
    } catch (error) {
      console.log(`   - No existing ${collection} records to clear`);
    }
  }
};

const seedVenues = async () => {
  console.log('🏟️ Creating venues...');
  
  const Venue = Parse.Object.extend('Venue');
  const venuesData = [
    {
      name: 'Jakarta Padel Center',
      isActive: true,
      pricing: { hourlyRate: 175000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'Senayan',
        fullAddress: 'Jl. Senayan Raya No. 1, Jakarta Selatan',
        coordinates: { lat: -6.2297, lng: 106.8075 }
      },
      facilities: ['Indoor Courts', 'Parking', 'Cafeteria', 'Pro Shop', 'Locker Rooms'],
      rating: 4.5,
      totalCourts: 4,
      courtTypes: ['indoor'],
      operatingHours: { open: '06:00', close: '23:00' },
      contactInfo: { phone: '+62-21-5555-0001', email: 'info@jakartapadelcenter.com' }
    },
    {
      name: 'Elite Padel Club Kemang',
      isActive: true,
      pricing: { hourlyRate: 200000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'Kemang',
        fullAddress: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
        coordinates: { lat: -6.2615, lng: 106.8106 }
      },
      facilities: ['Outdoor Courts', 'Indoor Courts', 'Parking', 'Restaurant', 'Swimming Pool'],
      rating: 4.7,
      totalCourts: 6,
      courtTypes: ['indoor', 'outdoor'],
      operatingHours: { open: '05:30', close: '24:00' },
      contactInfo: { phone: '+62-21-5555-0002', email: 'booking@elitepadelkemang.com' }
    },
    {
      name: 'Gading Padel Court',
      isActive: true,
      pricing: { hourlyRate: 150000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'Kelapa Gading',
        fullAddress: 'Mall of Indonesia, Kelapa Gading, Jakarta Utara',
        coordinates: { lat: -6.1478, lng: 106.8969 }
      },
      facilities: ['Indoor Courts', 'Parking', 'Food Court Access'],
      rating: 4.2,
      totalCourts: 3,
      courtTypes: ['indoor'],
      operatingHours: { open: '07:00', close: '22:00' },
      contactInfo: { phone: '+62-21-5555-0003', email: 'info@gadingpadel.com' }
    },
    {
      name: 'PIK Padel Arena',
      isActive: true,
      pricing: { hourlyRate: 180000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'PIK',
        fullAddress: 'Pantai Indah Kapuk, Jakarta Utara',
        coordinates: { lat: -6.1067, lng: 106.7436 }
      },
      facilities: ['Outdoor Courts', 'Parking', 'Cafeteria', 'Equipment Rental'],
      rating: 4.3,
      totalCourts: 5,
      courtTypes: ['outdoor'],
      operatingHours: { open: '06:00', close: '22:00' },
      contactInfo: { phone: '+62-21-5555-0004', email: 'arena@pikpadel.com' }
    },
    {
      name: 'BSD Padel Club',
      isActive: true,
      pricing: { hourlyRate: 160000, currency: 'IDR' },
      address: { 
        city: 'Tangerang', 
        area: 'BSD',
        fullAddress: 'BSD City, Tangerang Selatan',
        coordinates: { lat: -6.3018, lng: 106.6519 }
      },
      facilities: ['Indoor Courts', 'Outdoor Courts', 'Parking', 'Gym Access'],
      rating: 4.4,
      totalCourts: 4,
      courtTypes: ['indoor', 'outdoor'],
      operatingHours: { open: '06:00', close: '23:00' },
      contactInfo: { phone: '+62-21-5555-0005', email: 'info@bsdpadel.com' }
    },
    {
      name: 'Pondok Indah Padel',
      isActive: true,
      pricing: { hourlyRate: 220000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'Pondok Indah',
        fullAddress: 'Jl. Metro Pondok Indah, Jakarta Selatan',
        coordinates: { lat: -6.2659, lng: 106.7844 }
      },
      facilities: ['Indoor Courts', 'Parking', 'Spa', 'Restaurant', 'Pro Shop'],
      rating: 4.8,
      totalCourts: 3,
      courtTypes: ['indoor'],
      operatingHours: { open: '06:00', close: '23:00' },
      contactInfo: { phone: '+62-21-5555-0006', email: 'luxury@pondokindahpadel.com' }
    },
    {
      name: 'Menteng Padel Center',
      isActive: true,
      pricing: { hourlyRate: 190000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'Menteng',
        fullAddress: 'Jl. Menteng Raya No. 25, Jakarta Pusat',
        coordinates: { lat: -6.1944, lng: 106.8294 }
      },
      facilities: ['Indoor Courts', 'Parking', 'Cafeteria'],
      rating: 4.1,
      totalCourts: 2,
      courtTypes: ['indoor'],
      operatingHours: { open: '07:00', close: '22:00' },
      contactInfo: { phone: '+62-21-5555-0007', email: 'play@mentengpadel.com' }
    },
    {
      name: 'Kuningan Padel Sports',
      isActive: false, // Temporarily closed for testing
      pricing: { hourlyRate: 185000, currency: 'IDR' },
      address: { 
        city: 'Jakarta', 
        area: 'Kuningan',
        fullAddress: 'Jl. HR Rasuna Said, Kuningan, Jakarta Selatan',
        coordinates: { lat: -6.2297, lng: 106.8308 }
      },
      facilities: ['Indoor Courts', 'Parking'],
      rating: 4.0,
      totalCourts: 3,
      courtTypes: ['indoor'],
      operatingHours: { open: '06:00', close: '22:00' },
      contactInfo: { phone: '+62-21-5555-0008', email: 'info@kuninganpadel.com' }
    }
  ];

  const venues = [];
  for (const venueData of venuesData) {
    const venue = new Venue();
    Object.keys(venueData).forEach(key => {
      venue.set(key, venueData[key]);
    });
    await venue.save();
    venues.push(venue);
    console.log(`   ✅ Created venue: ${venueData.name}`);
  }

  return venues;
};

const seedPlayers = async () => {
  console.log('👥 Creating player profiles...');
  
  const PlayerProfile = Parse.Object.extend('PlayerProfile');
  const playersData = [
    {
      name: 'Ahmad Rizki',
      skillLevel: 'intermediate',
      preferredAreas: ['Senayan', 'Kemang'],
      preferredTimes: ['evening', 'weekend_morning'],
      isActive: true,
      lastActive: new Date(),
      gamesPlayed: 45,
      rating: 4.2,
      bio: 'Love playing padel after work. Looking for consistent partners.',
      availability: {
        monday: ['18:00-21:00'],
        tuesday: ['18:00-21:00'],
        wednesday: ['18:00-21:00'],
        thursday: ['18:00-21:00'],
        friday: ['18:00-21:00'],
        saturday: ['08:00-12:00', '16:00-20:00'],
        sunday: ['08:00-12:00']
      }
    },
    {
      name: 'Sarah Putri',
      skillLevel: 'advanced',
      preferredAreas: ['Kemang', 'Pondok Indah'],
      preferredTimes: ['morning', 'weekend'],
      isActive: true,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      gamesPlayed: 120,
      rating: 4.7,
      bio: 'Competitive player seeking challenging matches.',
      availability: {
        monday: ['06:00-08:00'],
        tuesday: ['06:00-08:00'],
        wednesday: ['06:00-08:00'],
        thursday: ['06:00-08:00'],
        friday: ['06:00-08:00'],
        saturday: ['07:00-11:00', '15:00-19:00'],
        sunday: ['07:00-11:00', '15:00-19:00']
      }
    },
    {
      name: 'Budi Santoso',
      skillLevel: 'beginner',
      preferredAreas: ['Kelapa Gading', 'PIK'],
      preferredTimes: ['weekend', 'evening'],
      isActive: true,
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      gamesPlayed: 8,
      rating: 3.5,
      bio: 'New to padel, eager to learn and improve.',
      availability: {
        saturday: ['09:00-13:00', '17:00-20:00'],
        sunday: ['09:00-13:00', '17:00-20:00'],
        wednesday: ['19:00-21:00']
      }
    },
    {
      name: 'Lisa Chen',
      skillLevel: 'intermediate',
      preferredAreas: ['BSD', 'PIK'],
      preferredTimes: ['morning', 'afternoon'],
      isActive: true,
      lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      gamesPlayed: 67,
      rating: 4.1,
      bio: 'Flexible schedule, love morning games.',
      availability: {
        monday: ['09:00-12:00'],
        tuesday: ['09:00-12:00'],
        wednesday: ['09:00-12:00'],
        thursday: ['09:00-12:00'],
        friday: ['09:00-12:00'],
        saturday: ['08:00-14:00'],
        sunday: ['08:00-14:00']
      }
    },
    {
      name: 'David Kurniawan',
      skillLevel: 'advanced',
      preferredAreas: ['Senayan', 'Menteng'],
      preferredTimes: ['evening', 'night'],
      isActive: true,
      lastActive: new Date(),
      gamesPlayed: 89,
      rating: 4.5,
      bio: 'Night owl player, prefer late evening games.',
      availability: {
        monday: ['20:00-23:00'],
        tuesday: ['20:00-23:00'],
        wednesday: ['20:00-23:00'],
        thursday: ['20:00-23:00'],
        friday: ['20:00-23:00'],
        saturday: ['18:00-23:00'],
        sunday: ['18:00-22:00']
      }
    },
    {
      name: 'Maya Sari',
      skillLevel: 'beginner',
      preferredAreas: ['Kemang', 'Senayan'],
      preferredTimes: ['afternoon', 'weekend'],
      isActive: true,
      lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      gamesPlayed: 12,
      rating: 3.8,
      bio: 'Learning padel, looking for patient partners.',
      availability: {
        saturday: ['14:00-18:00'],
        sunday: ['14:00-18:00'],
        tuesday: ['16:00-18:00'],
        thursday: ['16:00-18:00']
      }
    },
    {
      name: 'Ricky Tan',
      skillLevel: 'professional',
      preferredAreas: ['Pondok Indah', 'Kemang'],
      preferredTimes: ['morning', 'afternoon'],
      isActive: true,
      lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      gamesPlayed: 200,
      rating: 4.9,
      bio: 'Professional coach available for games and training.',
      availability: {
        monday: ['07:00-17:00'],
        tuesday: ['07:00-17:00'],
        wednesday: ['07:00-17:00'],
        thursday: ['07:00-17:00'],
        friday: ['07:00-17:00'],
        saturday: ['08:00-16:00'],
        sunday: ['08:00-16:00']
      }
    },
    {
      name: 'Indira Putri',
      skillLevel: 'intermediate',
      preferredAreas: ['BSD', 'Kelapa Gading'],
      preferredTimes: ['evening', 'weekend'],
      isActive: false, // Inactive for testing
      lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      gamesPlayed: 34,
      rating: 4.0,
      bio: 'Casual player, enjoy social games.',
      availability: {}
    },
    {
      name: 'Tommy Wijaya',
      skillLevel: 'advanced',
      preferredAreas: ['PIK', 'BSD'],
      preferredTimes: ['morning', 'weekend'],
      isActive: true,
      lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      gamesPlayed: 156,
      rating: 4.6,
      bio: 'Competitive player, love weekend tournaments.',
      availability: {
        saturday: ['06:00-12:00', '16:00-20:00'],
        sunday: ['06:00-12:00', '16:00-20:00'],
        monday: ['06:00-08:00'],
        wednesday: ['06:00-08:00'],
        friday: ['06:00-08:00']
      }
    },
    {
      name: 'Sinta Dewi',
      skillLevel: 'beginner',
      preferredAreas: ['Menteng', 'Senayan'],
      preferredTimes: ['morning', 'afternoon'],
      isActive: true,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      gamesPlayed: 5,
      rating: 3.2,
      bio: 'Just started playing, very enthusiastic!',
      availability: {
        monday: ['10:00-14:00'],
        tuesday: ['10:00-14:00'],
        wednesday: ['10:00-14:00'],
        thursday: ['10:00-14:00'],
        friday: ['10:00-14:00']
      }
    }
  ];

  const players = [];
  for (const playerData of playersData) {
    const player = new PlayerProfile();
    Object.keys(playerData).forEach(key => {
      player.set(key, playerData[key]);
    });
    await player.save();
    players.push(player);
    console.log(`   ✅ Created player: ${playerData.name} (${playerData.skillLevel})`);
  }

  return players;
};

const seedSessions = async (venues, players) => {
  console.log('🎮 Creating game sessions...');
  
  const Session = Parse.Object.extend('Session');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

  const sessionsData = [
    // Today's sessions - Senayan venue fully booked at 7 PM for nearby alternatives test
    {
      venue: venues[0], // Jakarta Padel Center (Senayan)
      date: today,
      startTime: '19:00',
      endTime: '20:00',
      maxPlayers: 4,
      currentPlayers: [players[0], players[1], players[2], players[3]], // Full session
      status: 'full',
      skillLevel: 'intermediate',
      cost: 175000,
      courtNumber: 1,
      gameType: 'doubles',
      description: 'FULL - Friendly doubles game, intermediate level'
    },
    {
      venue: venues[1], // Elite Padel Club Kemang
      date: today,
      startTime: '20:00',
      endTime: '21:00',
      maxPlayers: 4,
      currentPlayers: [players[4]], // David
      status: 'open',
      skillLevel: 'advanced',
      cost: 200000,
      courtNumber: 2,
      gameType: 'doubles',
      description: 'Competitive doubles, advanced players only'
    },
    {
      venue: venues[2], // Gading Padel Court
      date: today,
      startTime: '18:00',
      endTime: '19:00',
      maxPlayers: 4,
      currentPlayers: [players[2], players[5], players[9]], // Budi, Maya, Sinta
      status: 'open',
      skillLevel: 'beginner',
      cost: 150000,
      courtNumber: 1,
      gameType: 'doubles',
      description: 'Beginner-friendly session, learning together'
    },
    // Tomorrow's sessions
    {
      venue: venues[0], // Jakarta Padel Center
      date: tomorrow,
      startTime: '08:00',
      endTime: '09:00',
      maxPlayers: 4,
      currentPlayers: [players[1], players[3]], // Sarah, Lisa
      status: 'open',
      skillLevel: 'intermediate',
      cost: 175000,
      courtNumber: 2,
      gameType: 'doubles',
      description: 'Morning doubles session'
    },
    {
      venue: venues[1], // Elite Padel Club Kemang
      date: tomorrow,
      startTime: '18:00',
      endTime: '19:00',
      maxPlayers: 4,
      currentPlayers: [players[0], players[4], players[6], players[8]], // Full session
      status: 'full',
      skillLevel: 'advanced',
      cost: 200000,
      courtNumber: 1,
      gameType: 'doubles',
      description: 'Advanced competitive doubles - FULL'
    },
    {
      venue: venues[3], // PIK Padel Arena
      date: tomorrow,
      startTime: '09:00',
      endTime: '10:00',
      maxPlayers: 4,
      currentPlayers: [players[3], players[8]], // Lisa, Tommy
      status: 'open',
      skillLevel: 'intermediate',
      cost: 180000,
      courtNumber: 3,
      gameType: 'doubles',
      description: 'Weekend morning session at PIK'
    },
    {
      venue: venues[4], // BSD Padel Club
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      maxPlayers: 4,
      currentPlayers: [], // Empty session for testing
      status: 'open',
      skillLevel: 'any',
      cost: 160000,
      courtNumber: 1,
      gameType: 'doubles',
      description: 'Open session, all skill levels welcome'
    },
    // Day after tomorrow sessions
    {
      venue: venues[5], // Pondok Indah Padel
      date: dayAfterTomorrow,
      startTime: '07:00',
      endTime: '08:00',
      maxPlayers: 4,
      currentPlayers: [players[6]], // Ricky (professional)
      status: 'open',
      skillLevel: 'advanced',
      cost: 220000,
      courtNumber: 1,
      gameType: 'training',
      description: 'Training session with professional coach'
    },
    {
      venue: venues[6], // Menteng Padel Center
      date: dayAfterTomorrow,
      startTime: '19:00',
      endTime: '20:00',
      maxPlayers: 4,
      currentPlayers: [players[4], players[9]], // David, Sinta
      status: 'open',
      skillLevel: 'mixed',
      cost: 190000,
      courtNumber: 1,
      gameType: 'doubles',
      description: 'Mixed skill level session, mentoring welcome'
    },
    // Past session for testing (should not appear in searches)
    {
      venue: venues[0], // Jakarta Padel Center
      date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      startTime: '19:00',
      endTime: '20:00',
      maxPlayers: 4,
      currentPlayers: [players[0], players[1], players[2], players[3]],
      status: 'completed',
      skillLevel: 'intermediate',
      cost: 175000,
      courtNumber: 1,
      gameType: 'doubles',
      description: 'Completed session from yesterday'
    }
  ];

  const sessions = [];
  for (const sessionData of sessionsData) {
    const session = new Session();
    Object.keys(sessionData).forEach(key => {
      session.set(key, sessionData[key]);
    });
    await session.save();
    sessions.push(session);
    console.log(`   ✅ Created session: ${sessionData.venue.get('name')} - ${sessionData.date.toDateString()} ${sessionData.startTime}`);
  }

  return sessions;
};

const seedBookings = async (sessions, players) => {
  console.log('📅 Creating booking history...');
  
  const Booking = Parse.Object.extend('Booking');
  const bookingsData = [
    {
      session: sessions[0],
      player: players[0],
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      paymentStatus: 'paid',
      amount: 43750 // 175000 / 4 players
    },
    {
      session: sessions[0],
      player: players[1],
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      paymentStatus: 'paid',
      amount: 43750
    },
    {
      session: sessions[4], // Full session
      player: players[0],
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
      paymentStatus: 'paid',
      amount: 50000
    },
    {
      session: sessions[4], // Full session
      player: players[4],
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      paymentStatus: 'paid',
      amount: 50000
    },
    {
      session: sessions[4], // Full session
      player: players[6],
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      paymentStatus: 'paid',
      amount: 50000
    },
    {
      session: sessions[4], // Full session
      player: players[8],
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
      paymentStatus: 'paid',
      amount: 50000
    }
  ];

  for (const bookingData of bookingsData) {
    const booking = new Booking();
    Object.keys(bookingData).forEach(key => {
      booking.set(key, bookingData[key]);
    });
    await booking.save();
    console.log(`   ✅ Created booking for ${bookingData.player.get('name')}`);
  }
};

const seedAnalytics = async () => {
  console.log('📊 Creating analytics data...');
  
  const Analytics = Parse.Object.extend('Analytics');
  
  const analyticsData = {
    popularTimes: {
      weekday: ['18:00-19:00', '19:00-20:00', '20:00-21:00'],
      weekend: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '18:00-19:00']
    },
    popularAreas: ['Senayan', 'Kemang', 'PIK', 'BSD', 'Pondok Indah'],
    averagePricing: {
      budget: { min: 150000, max: 170000 },
      standard: { min: 170000, max: 200000 },
      premium: { min: 200000, max: 250000 }
    },
    skillDistribution: {
      beginner: 30,
      intermediate: 45,
      advanced: 20,
      professional: 5
    },
    peakHours: {
      monday: ['18:00-21:00'],
      tuesday: ['18:00-21:00'],
      wednesday: ['18:00-21:00'],
      thursday: ['18:00-21:00'],
      friday: ['18:00-21:00'],
      saturday: ['08:00-12:00', '16:00-20:00'],
      sunday: ['08:00-12:00', '16:00-20:00']
    },
    weatherPreferences: {
      indoor_preferred_conditions: ['rain', 'extreme_heat', 'high_humidity'],
      outdoor_preferred_conditions: ['sunny', 'partly_cloudy', 'mild_temperature']
    }
  };

  const analytics = new Analytics();
  Object.keys(analyticsData).forEach(key => {
    analytics.set(key, analyticsData[key]);
  });
  await analytics.save();
  console.log('   ✅ Created analytics data');
};

// Run the seeding script
seedComprehensiveTestData();