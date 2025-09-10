# Database Setup Guide for AI Testing

## 🎯 **Quick Setup (Recommended)**

### **Step 1: Keep Existing Data**
```bash
# Don't clean database - keep booking history for realistic scenarios
# This enables "show my past bookings" and similar scenarios
```

### **Step 2: Add Seed Data**
```bash
# Navigate to project root
cd MaBar

# Install dependencies if needed
npm install parse

# Set environment variables
export VITE_BACK4APP_APP_ID="your_app_id"
export VITE_BACK4APP_JAVASCRIPT_KEY="your_js_key" 
export VITE_BACK4APP_MASTER_KEY="your_master_key"

# Run seed script
node scripts/seedDatabaseForAITesting.js
```

### **Step 3: Verify Data**
```bash
# Check Back4App dashboard to confirm:
# - 6 venues created
# - 10 player profiles created
# - 3 booking history records
# - 3 open sessions created
```

## 📊 **What Gets Created**

### **Venues (6 locations)**
```javascript
// Kedoya Area (for location-specific tests)
- Kedoya Padel Club (4 courts, 180k/hour)
- Padel Arena Kedoya (6 courts, 200k/hour)

// South Jakarta (for area expansion tests)  
- Senayan Padel Center (8 courts, 250k/hour)
- Pondok Indah Padel (5 courts, 220k/hour)

// Premium venue
- Plaza Indonesia Padel (3 courts, 300k/hour)

// Budget option
- Cengkareng Sports Center (3 courts, 120k/hour)
```

### **Player Profiles (10 players)**
```javascript
// Skill level distribution for matching tests
- Beginners: 3 players (various locations/times)
- Intermediate: 4 players (different preferences)
- Advanced: 3 players (premium venues)
```

### **Booking History (3 records)**
```javascript
// Enables "show my bookings" scenarios
- Past completed booking (Kedoya Padel Club)
- Recent completed booking (Senayan Padel Center)  
- Upcoming booking (Kedoya Padel Club)
```

### **Open Sessions (3 sessions)**
```javascript
// For "join session" scenarios
- Tomorrow evening intermediate session (2/4 players)
- Tomorrow evening advanced session (3/4 players)
- Weekend morning beginner session (1/4 players)
```

## 🧪 **Testing Scenarios Enabled**

### **Simple Scenarios**
```javascript
// These will work immediately after seeding
"Find courts in Kedoya tomorrow at 7pm"
"Show me intermediate players"
"I want to join a session tomorrow"
```

### **Complex Scenarios**
```javascript
// Multi-turn negotiations with real data
"Find me a court under 200k per hour"
"Show me my booking history"
"Book the same court as last week"
```

### **Edge Cases**
```javascript
// No results scenarios
"Find courts in Bali" // No venues outside Jakarta
"Find courts at 3am" // Outside operating hours
"Find courts for 50k per hour" // Below minimum price
```

## 🔧 **Alternative Setup Options**

### **Option A: Fresh Database**
```bash
# If you want completely clean data
# 1. Delete all records in Back4App dashboard
# 2. Run seed script
node scripts/seedDatabaseForAITesting.js
```

### **Option B: Partial Seeding**
```bash
# Modify seed script to only add specific data types
# Edit scripts/seedDatabaseForAITesting.js
# Comment out sections you don't want
```

### **Option C: Custom Data**
```bash
# Add your own test data
# Use the seed script as template
# Modify venue locations, prices, player profiles as needed
```

## 🚀 **Running AI Tests**

### **After Database Setup**
```javascript
// Open MaBar app → AI Chat → Browser Console

// Test with real data
EnhancedAITest.testRealDatabaseIntegration()

// Test multi-turn negotiations
EnhancedAITest.testMultiTurnNegotiation()

// Test complete scenarios
EnhancedAITest.runAllEnhancedTests()
```

### **Verify Real Data Integration**
```javascript
// These should return actual results from database
SimpleFlowExample.exampleVenueSearch()
SimpleFlowExample.exampleWithMockData()
```

## 📋 **Data Validation Checklist**

### **Venues**
- ✅ 6 venues across different Jakarta areas
- ✅ Varied pricing (120k - 300k per hour)
- ✅ Different court counts (3-8 courts)
- ✅ Realistic availability patterns
- ✅ Operating hours and facilities

### **Players**
- ✅ 10 players with different skill levels
- ✅ Varied location preferences
- ✅ Different time preferences
- ✅ Realistic names and profiles

### **Bookings**
- ✅ Past completed bookings
- ✅ Upcoming reservations
- ✅ Different venues and dates
- ✅ Realistic player combinations

### **Sessions**
- ✅ Open sessions for joining
- ✅ Different skill levels
- ✅ Various time slots
- ✅ Realistic pricing per person

## 🔍 **Troubleshooting**

### **Seed Script Fails**
```bash
# Check environment variables
echo $VITE_BACK4APP_APP_ID
echo $VITE_BACK4APP_JAVASCRIPT_KEY
echo $VITE_BACK4APP_MASTER_KEY

# Verify Parse connection
node -e "console.log('Parse keys:', process.env.VITE_BACK4APP_APP_ID)"
```

### **No Results in AI Tests**
```bash
# Verify data was created in Back4App dashboard
# Check Venue, PlayerProfile, Booking, Session classes
# Ensure data has proper field names and values
```

### **AI Tests Not Finding Data**
```bash
# Check MatchmakingToolboxService queries
# Verify field names match between seed data and queries
# Test database queries directly in Back4App dashboard
```

## 📊 **Expected Test Results**

### **After Successful Setup**
- ✅ Venue searches return 1-6 results depending on criteria
- ✅ Player searches return relevant profiles
- ✅ Session joining shows available sessions
- ✅ Booking history displays past/upcoming bookings
- ✅ No availability scenarios trigger AI negotiations
- ✅ Enhanced AI communication shows multi-turn discussions

### **Performance Expectations**
- Simple queries: < 2 seconds
- Complex negotiations: < 6 seconds  
- Database queries: < 500ms
- AI processing: 1-3 seconds per turn

This setup provides comprehensive, realistic data for testing all AI scenarios from simple venue searches to complex multi-turn negotiations.