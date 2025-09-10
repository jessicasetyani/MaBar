/**
 * Database Seed Script for AI Testing Scenarios
 * Creates realistic data for comprehensive AI testing
 */

const Parse = require('parse/node')

// Initialize Parse
Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
)
Parse.serverURL = 'https://parseapi.back4app.com/'

async function seedDatabase() {
  console.log('🌱 Starting database seeding for AI testing...')

  try {
    // 1. Create realistic venues
    await seedVenues()
    
    // 2. Create diverse player profiles
    await seedPlayers()
    
    // 3. Create booking history
    await seedBookingHistory()
    
    // 4. Create current sessions
    await seedCurrentSessions()
    
    console.log('✅ Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  }
}

async function seedVenues() {
  console.log('🏟️ Seeding venues...')
  
  const venues = [
    // Kedoya Area (for location-specific tests)
    {
      name: 'Kedoya Padel Club',
      location: 'Kedoya',
      address: 'Jl. Kedoya Raya No. 15, Jakarta Barat',
      pricePerHour: 180000,
      totalCourts: 4,
      facilities: ['Parking', 'Shower', 'Equipment Rental'],
      operatingHours: { open: '06:00', close: '23:00' },
      rating: 4.5,
      availability: generateAvailability()
    },
    {
      name: 'Padel Arena Kedoya',
      location: 'Kedoya',
      address: 'Jl. Panjang No. 88, Jakarta Barat',
      pricePerHour: 200000,
      totalCourts: 6,
      facilities: ['Parking', 'Shower', 'Cafe', 'Equipment Rental'],
      operatingHours: { open: '07:00', close: '22:00' },
      rating: 4.7,
      availability: generateAvailability()
    },
    
    // South Jakarta (for area expansion tests)
    {
      name: 'Senayan Padel Center',
      location: 'Senayan',
      address: 'Jl. Senayan No. 10, Jakarta Selatan',
      pricePerHour: 250000,
      totalCourts: 8,
      facilities: ['Parking', 'Shower', 'Cafe', 'Pro Shop', 'Coaching'],
      operatingHours: { open: '06:00', close: '24:00' },
      rating: 4.8,
      availability: generateAvailability()
    },
    {
      name: 'Pondok Indah Padel',
      location: 'Pondok Indah',
      address: 'Jl. Metro Pondok Indah, Jakarta Selatan',
      pricePerHour: 220000,
      totalCourts: 5,
      facilities: ['Parking', 'Shower', 'Equipment Rental'],
      operatingHours: { open: '07:00', close: '23:00' },
      rating: 4.4,
      availability: generateAvailability()
    },
    
    // Central Jakarta (premium venues)
    {
      name: 'Plaza Indonesia Padel',
      location: 'Thamrin',
      address: 'Plaza Indonesia, Jakarta Pusat',
      pricePerHour: 300000,
      totalCourts: 3,
      facilities: ['Valet Parking', 'Premium Shower', 'Cafe', 'Pro Shop'],
      operatingHours: { open: '08:00', close: '22:00' },
      rating: 4.9,
      availability: generateAvailability(0.3) // Less availability (premium)
    },
    
    // Budget-friendly options
    {
      name: 'Cengkareng Sports Center',
      location: 'Cengkareng',
      address: 'Jl. Cengkareng Raya, Jakarta Barat',
      pricePerHour: 120000,
      totalCourts: 3,
      facilities: ['Parking', 'Basic Shower'],
      operatingHours: { open: '06:00', close: '21:00' },
      rating: 4.0,
      availability: generateAvailability(0.8) // High availability
    }
  ]

  for (const venueData of venues) {
    const Venue = Parse.Object.extend('Venue')
    const venue = new Venue()
    
    Object.keys(venueData).forEach(key => {
      venue.set(key, venueData[key])
    })
    
    await venue.save(null, { useMasterKey: true })
  }
  
  console.log(`✅ Created ${venues.length} venues`)
}

async function seedPlayers() {
  console.log('👥 Seeding players...')
  
  const players = [
    // Beginner players
    { name: 'Andi Pratama', skillLevel: 'beginner', preferredTime: 'evening', location: 'Jakarta Barat' },
    { name: 'Sari Dewi', skillLevel: 'beginner', preferredTime: 'morning', location: 'Jakarta Selatan' },
    { name: 'Budi Santoso', skillLevel: 'beginner', preferredTime: 'weekend', location: 'Jakarta Barat' },
    
    // Intermediate players
    { name: 'Maya Sari', skillLevel: 'intermediate', preferredTime: 'evening', location: 'Jakarta Selatan' },
    { name: 'Rudi Hartono', skillLevel: 'intermediate', preferredTime: 'afternoon', location: 'Jakarta Pusat' },
    { name: 'Lisa Wijaya', skillLevel: 'intermediate', preferredTime: 'morning', location: 'Jakarta Barat' },
    { name: 'Doni Setiawan', skillLevel: 'intermediate', preferredTime: 'evening', location: 'Jakarta Selatan' },
    
    // Advanced players
    { name: 'Carlos Rodriguez', skillLevel: 'advanced', preferredTime: 'morning', location: 'Jakarta Selatan' },
    { name: 'Maria Santos', skillLevel: 'advanced', preferredTime: 'evening', location: 'Jakarta Pusat' },
    { name: 'Ahmad Fauzi', skillLevel: 'advanced', preferredTime: 'afternoon', location: 'Jakarta Barat' }
  ]

  for (const playerData of players) {
    const PlayerProfile = Parse.Object.extend('PlayerProfile')
    const player = new PlayerProfile()
    
    Object.keys(playerData).forEach(key => {
      player.set(key, playerData[key])
    })
    
    await player.save(null, { useMasterKey: true })
  }
  
  console.log(`✅ Created ${players.length} players`)
}

async function seedBookingHistory() {
  console.log('📚 Seeding booking history...')
  
  // Create past bookings for realistic "show my history" scenarios
  const bookings = [
    {
      userId: 'user123',
      venueName: 'Kedoya Padel Club',
      date: '2024-01-15',
      time: '19:00',
      duration: 90,
      cost: 270000,
      status: 'completed',
      players: ['User', 'Maya Sari', 'Rudi Hartono', 'Lisa Wijaya']
    },
    {
      userId: 'user123',
      venueName: 'Senayan Padel Center',
      date: '2024-01-08',
      time: '20:00',
      duration: 60,
      cost: 250000,
      status: 'completed',
      players: ['User', 'Carlos Rodriguez']
    },
    {
      userId: 'user123',
      venueName: 'Kedoya Padel Club',
      date: '2024-01-22',
      time: '18:00',
      duration: 90,
      cost: 270000,
      status: 'upcoming',
      players: ['User', 'Doni Setiawan', 'Ahmad Fauzi']
    }
  ]

  for (const bookingData of bookings) {
    const Booking = Parse.Object.extend('Booking')
    const booking = new Booking()
    
    Object.keys(bookingData).forEach(key => {
      booking.set(key, bookingData[key])
    })
    
    await booking.save(null, { useMasterKey: true })
  }
  
  console.log(`✅ Created ${bookings.length} booking records`)
}

async function seedCurrentSessions() {
  console.log('🎯 Seeding current sessions...')
  
  // Create open sessions for "join session" scenarios
  const sessions = [
    {
      venueName: 'Kedoya Padel Club',
      organizerName: 'Maya Sari',
      date: getTomorrowDate(),
      time: '19:00',
      skillLevel: 'intermediate',
      currentPlayers: 2,
      maxPlayers: 4,
      costPerPerson: 67500,
      status: 'open'
    },
    {
      venueName: 'Senayan Padel Center',
      organizerName: 'Carlos Rodriguez',
      date: getTomorrowDate(),
      time: '20:00',
      skillLevel: 'advanced',
      currentPlayers: 3,
      maxPlayers: 4,
      costPerPerson: 62500,
      status: 'open'
    },
    {
      venueName: 'Pondok Indah Padel',
      organizerName: 'Andi Pratama',
      date: getWeekendDate(),
      time: '09:00',
      skillLevel: 'beginner',
      currentPlayers: 1,
      maxPlayers: 4,
      costPerPerson: 55000,
      status: 'open'
    }
  ]

  for (const sessionData of sessions) {
    const Session = Parse.Object.extend('Session')
    const session = new Session()
    
    Object.keys(sessionData).forEach(key => {
      session.set(key, sessionData[key])
    })
    
    await session.save(null, { useMasterKey: true })
  }
  
  console.log(`✅ Created ${sessions.length} open sessions`)
}

// Helper functions
function generateAvailability(busyFactor = 0.5) {
  const availability = {}
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  days.forEach(day => {
    availability[day] = {}
    for (let hour = 6; hour <= 23; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`
      availability[day][timeSlot] = Math.random() > busyFactor
    }
  })
  
  return availability
}

function getTomorrowDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

function getWeekendDate() {
  const date = new Date()
  const daysUntilSaturday = (6 - date.getDay()) % 7
  date.setDate(date.getDate() + daysUntilSaturday)
  return date.toISOString().split('T')[0]
}

// Run seeding
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }