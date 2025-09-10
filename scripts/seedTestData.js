/**
 * Minimal Test Data for AI Testing
 */

const Parse = require('parse/node')

Parse.initialize(
  process.env.VITE_BACK4APP_APP_ID,
  process.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  process.env.VITE_BACK4APP_MASTER_KEY
)
Parse.serverURL = 'https://parseapi.back4app.com/'

async function seedTestData() {
  console.log('🌱 Seeding test data...')

  // 3 venues
  const venues = [
    { name: 'Kedoya Padel Club', location: 'Kedoya', pricePerHour: 180000 },
    { name: 'Senayan Padel Center', location: 'Senayan', pricePerHour: 250000 },
    { name: 'Plaza Indonesia Padel', location: 'Thamrin', pricePerHour: 300000 }
  ]

  // 3 players
  const players = [
    { name: 'Maya Sari', skillLevel: 'intermediate' },
    { name: 'Carlos Rodriguez', skillLevel: 'advanced' },
    { name: 'Andi Pratama', skillLevel: 'beginner' }
  ]

  for (const venueData of venues) {
    const Venue = Parse.Object.extend('Venue')
    const venue = new Venue()
    Object.keys(venueData).forEach(key => venue.set(key, venueData[key]))
    await venue.save(null, { useMasterKey: true })
  }

  for (const playerData of players) {
    const PlayerProfile = Parse.Object.extend('PlayerProfile')
    const player = new PlayerProfile()
    Object.keys(playerData).forEach(key => player.set(key, playerData[key]))
    await player.save(null, { useMasterKey: true })
  }

  console.log('✅ Test data created')
}

if (require.main === module) {
  seedTestData()
}

module.exports = { seedTestData }