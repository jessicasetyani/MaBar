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

const addTestVenues = async () => {
  try {
    console.log('🏟️ Adding test venues to Back4App...');
    
    // Use master key for this operation
    Parse.Cloud.useMasterKey();
    
    const Venue = Parse.Object.extend('Venue');
    
    const venues = [
      {
        name: 'Jakarta Padel Center',
        isActive: true,
        pricing: { hourlyRate: 175000 },
        address: { city: 'Jakarta', area: 'Senayan' },
        facilities: ['Indoor Courts', 'Parking', 'Cafeteria'],
        rating: 4.5
      },
      {
        name: 'Elite Padel Club',
        isActive: true,
        pricing: { hourlyRate: 200000 },
        address: { city: 'Jakarta', area: 'Kemang' },
        facilities: ['Outdoor Courts', 'Parking', 'Pro Shop'],
        rating: 4.2
      },
      {
        name: 'Gading Padel Court',
        isActive: true,
        pricing: { hourlyRate: 150000 },
        address: { city: 'Jakarta', area: 'Kelapa Gading' },
        facilities: ['Indoor Courts', 'Parking'],
        rating: 4.0
      }
    ];

    for (const venueData of venues) {
      const venue = new Venue();
      venue.set('name', venueData.name);
      venue.set('isActive', venueData.isActive);
      venue.set('pricing', venueData.pricing);
      venue.set('address', venueData.address);
      venue.set('facilities', venueData.facilities);
      venue.set('rating', venueData.rating);
      
      await venue.save();
      console.log('✅ Added venue:', venueData.name);
    }
    
    console.log('🎉 All test venues added successfully!');
    
    // Verify venues were added
    const query = new Parse.Query(Venue);
    const allVenues = await query.find();
    console.log(`📊 Total venues in database: ${allVenues.length}`);
    
  } catch (error) {
    console.error('❌ Error adding venues:', error.message);
    process.exit(1);
  }
};

// Run the script
addTestVenues();