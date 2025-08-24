const mongoose = require('mongoose');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🔄 Setting up MaBar database...');
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mabar', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Create collections if they don't exist
    const collections = [
      'users',
      'venues',
      'bookings',
      'sessions',
      'reviews',
      'notifications'
    ];

    for (const collectionName of collections) {
      try {
        await conn.connection.db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection already exists: ${collectionName}`);
        } else {
          console.error(`❌ Error creating collection ${collectionName}:`, error.message);
        }
      }
    }

    // Create indexes for better performance
    const db = conn.connection.db;
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ 'oauth.googleId': 1 }, { sparse: true });
    await db.collection('users').createIndex({ 'oauth.facebookId': 1 }, { sparse: true });
    await db.collection('users').createIndex({ location: '2dsphere' });
    console.log('✅ Created indexes for users collection');

    // Venues collection indexes
    await db.collection('venues').createIndex({ location: '2dsphere' });
    await db.collection('venues').createIndex({ ownerId: 1 });
    await db.collection('venues').createIndex({ name: 'text', description: 'text' });
    console.log('✅ Created indexes for venues collection');

    // Bookings collection indexes
    await db.collection('bookings').createIndex({ userId: 1 });
    await db.collection('bookings').createIndex({ venueId: 1 });
    await db.collection('bookings').createIndex({ sessionDate: 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    console.log('✅ Created indexes for bookings collection');

    // Sessions collection indexes
    await db.collection('sessions').createIndex({ venueId: 1 });
    await db.collection('sessions').createIndex({ createdBy: 1 });
    await db.collection('sessions').createIndex({ sessionDate: 1 });
    await db.collection('sessions').createIndex({ status: 1 });
    console.log('✅ Created indexes for sessions collection');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('📝 Collections created:');
    collections.forEach(col => console.log(`   - ${col}`));
    console.log('\n🔍 Indexes created for optimal performance');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the setup
setupDatabase();
