/**
 * Minimal Test Data for Real AI Scenarios
 * Only essential data for complex scenario testing
 */

const Parse = require('parse/node')

Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
)
Parse.serverURL = 'https://parseapi.back4app.com/'

async function seedMinimalData() {
  console.log('🌱 Seeding minimal test data...')

  // Essential venues for testing
  const venues = [
    {
      name: 'Kedoya Padel Club',
      location: 'Kedoya',
      pricePerHour: 180000,
      totalCourts: 4,
      availability: generateTomorrowAvailability()
    },
    {
      name: 'Plaza Indonesia Padel',
      location: 'Thamrin',
      pricePerHour: 300000,
      totalCourts: 3,
      availability: generateTomorrowAvailability()
    },
    {
      name: 'Senayan Padel Center',
      location: 'Senayan',
      pricePerHour: 250000,
      totalCourts: 8,
      availability: generateTomorrowAvailability()
    }
  ]

  // Essential players for testing
  const players = [
    { name: 'Maya Sari', skillLevel: 'intermediate', location: 'Jakarta Selatan' },
    { name: 'Carlos Rodriguez', skillLevel: 'advanced', location: 'Jakarta Pusat' },
    { name: 'Andi Pratama', skillLevel: 'beginner', location: 'Jakarta Barat' }
  ]

  // Create venues
  for (const venueData of venues) {
    const Venue = Parse.Object.extend('Venue')
    const venue = new Venue()
    Object.keys(venueData).forEach(key => venue.set(key, venueData[key]))
    await venue.save(null, { useMasterKey: true })
  }

  // Create players
  for (const playerData of players) {
    const PlayerProfile = Parse.Object.extend('PlayerProfile')
    const player = new PlayerProfile()
    Object.keys(playerData).forEach(key => player.set(key, playerData[key]))
    await player.save(null, { useMasterKey: true })
  }

  console.log('✅ Minimal test data created')
}

function generateTomorrowAvailability() {
  return {
    tomorrow: {
      '19:00': true,
      '20:00': true,
      '21:00': false // Some unavailable slots for testing
    }
  }
}

if (require.main === module) {
  seedMinimalData()
}

module.exports = { seedMinimalData }