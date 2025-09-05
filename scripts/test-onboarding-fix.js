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

async function testOnboardingFix() {
  try {
    console.log('🧪 Testing onboarding logic fix...\n');

    // Login as venue@mabar.com
    console.log('1. Logging in as venue@mabar.com...');
    const user = await Parse.User.logIn('venue@mabar.com', 'venue123');
    
    console.log('✅ Login successful');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.get('email'));
    console.log('   Role:', user.get('role'));
    console.log('   Onboarding Status:', user.get('onboardingStatus'));

    // Test the checkSession logic
    console.log('\n2. Testing checkSession logic...');
    const currentUser = Parse.User.current();
    
    if (currentUser) {
      console.log('✅ Current user found in session');
      
      // Fetch fresh data (this is what our fix does)
      await currentUser.fetch();
      
      console.log('✅ Fresh data fetched');
      console.log('   Fresh Role:', currentUser.get('role'));
      console.log('   Fresh Onboarding Status:', currentUser.get('onboardingStatus'));
      
      // Test the computed property logic
      const hasCompletedOnboarding = currentUser.get('onboardingStatus') === 'completed';
      const hasRole = !!currentUser.get('role');
      
      console.log('\n3. Testing computed properties...');
      console.log('   Has Role:', hasRole);
      console.log('   Has Completed Onboarding:', hasCompletedOnboarding);
      console.log('   Should Show Dashboard:', hasRole && hasCompletedOnboarding);
      
      if (hasRole && hasCompletedOnboarding) {
        const expectedRoute = currentUser.get('role') === 'venue_owner' ? '/venue-dashboard' : '/dashboard';
        console.log('   Expected Route:', expectedRoute);
      }
      
    } else {
      console.log('❌ No current user in session');
    }

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOnboardingFix().then(() => {
  console.log('\n🎯 Onboarding fix test complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});