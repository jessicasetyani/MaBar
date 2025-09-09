# MaBar AI Chat Testing Guide

## Overview
This guide provides comprehensive testing tools and scenarios for the MaBar AI matchmaking system. Use these tools to validate AI responses across various user inputs and edge cases.

## 📁 Testing Files Created

### 1. Test Scenarios Documentation
- **File:** `docs/AI_CHAT_TEST_SCENARIOS.md`
- **Purpose:** Comprehensive list of user stories and expected AI responses
- **Contains:** 50+ test scenarios covering successful matches, no matches, edge cases, language variations

### 2. Mock Data Seeding Script
- **File:** `scripts/seed-comprehensive-test-data.js`
- **Purpose:** Creates realistic test data for all scenarios
- **Creates:**
  - 8 venues across Jakarta areas
  - 10 player profiles with different skill levels
  - 10+ game sessions (past, present, future)
  - Booking history and analytics data

### 3. Automated Test Runner
- **File:** `scripts/test-ai-scenarios.js`
- **Purpose:** Systematically tests AI responses against all scenarios
- **Features:**
  - Automated input/output validation
  - Pass/fail reporting
  - Detailed analysis and recommendations

### 4. Data Validation Script
- **File:** `scripts/validate-test-data.js`
- **Purpose:** Ensures test data covers all required scenarios
- **Validates:**
  - Data completeness and quality
  - Scenario coverage analysis
  - Relationship consistency

## 🚀 Quick Start

### Step 1: Seed Test Data
```bash
# Navigate to project root
cd /media/ali-naga-saputra/50GB-ext4/Projects/MaBar

# Install dependencies if not already done
npm install

# Seed comprehensive test data
node scripts/seed-comprehensive-test-data.js
```

### Step 2: Validate Data Coverage
```bash
# Ensure data covers all test scenarios
node scripts/validate-test-data.js
```

### Step 3: Run Automated Tests
```bash
# Test AI responses against all scenarios
node scripts/test-ai-scenarios.js
```

### Step 4: Manual Testing
```bash
# Start the development server
npm run dev

# Navigate to AI Chat and test scenarios manually
# Use the test scenarios from AI_CHAT_TEST_SCENARIOS.md
```

## 📋 Test Scenario Categories

### 1. Successful Match Scenarios ✅
- Perfect match found
- Multiple options available
- Skill-based matching
- **Expected:** Show existing sessions with join options

### 2. No Match Scenarios ❌
- No available sessions (3 AM request)
- Fully booked venues
- No players in area
- **Expected:** Suggest alternatives, create new session options

### 3. Venue Listing Scenarios 🏟️
- List all venues
- Area-specific venues (Kemang, Senayan)
- Price-based filtering
- **Expected:** Display venue cards with details

### 4. Player Listing Scenarios 👥
- Available players tonight
- Skill-specific players
- No players available
- **Expected:** Show player profiles with invite options

### 5. Edge Cases & Error Handling ⚠️
- Typos: "Find crts in snayan tmrw"
- Single character: "a"
- Ambiguous: "Book something"
- Invalid location: "New York"
- Invalid time: "yesterday"
- Nonsensical: "Purple elephant"
- **Expected:** Graceful error handling with helpful guidance

### 6. Language Variations 🌐
- Bahasa Indonesia: "Cari lapangan padel"
- Mixed language: "Find court di Senayan"
- **Expected:** Understand and respond appropriately

## 🎯 Key Test Cases to Focus On

### High Priority Tests
1. **"I want to play padel tonight at 7 PM in Senayan"**
   - Should find existing sessions
   - Show available slots
   - Provide join buttons

2. **"I want to play at 3 AM tonight"**
   - Should show no availability
   - Suggest popular evening times
   - Offer to create session

3. **"Show me all padel courts in Jakarta"**
   - Display 5+ venue cards
   - Include pricing and location
   - Show availability status

4. **"a" (single character)**
   - Ask for more details
   - Provide guided questions
   - Show quick action buttons

5. **"Find courts in New York"**
   - Explain Jakarta-only service
   - Show Jakarta alternatives
   - Maintain helpful tone

### Medium Priority Tests
- Skill level filtering
- Price range filtering
- Area-specific searches
- Time preference matching
- Player availability

### Low Priority Tests
- Language mixing
- Complex typos
- Multi-step conversations
- Weather integration

## 📊 Expected Response Patterns

### Successful Response Structure
```json
{
  "text": "I found some great options for you:",
  "sessionCards": [
    {
      "type": "existing-session",
      "data": {
        "venue": "Jakarta Padel Center",
        "time": "7:00 PM",
        "players": 2,
        "openSlots": 2,
        "cost": "175k/hour"
      }
    }
  ]
}
```

### No Match Response Structure
```json
{
  "text": "No sessions found for your requested time.",
  "sessionCards": [
    {
      "type": "no-availability",
      "data": {
        "message": "No sessions available at 3 AM",
        "suggestions": ["6 PM - 8 PM", "7 PM - 9 PM"],
        "alternatives": ["Create new session", "Join waiting list"]
      }
    }
  ]
}
```

### Error Response Structure
```json
{
  "text": "I need more details to help you.",
  "needsMoreInfo": true,
  "sessionCards": [
    {
      "type": "clarification",
      "data": {
        "questions": ["When would you like to play?", "Which area do you prefer?"],
        "quickActions": ["Tonight", "Tomorrow", "This weekend"]
      }
    }
  ]
}
```

## 🔧 Customizing Tests

### Adding New Test Scenarios
1. Edit `scripts/test-ai-scenarios.js`
2. Add new scenario to `testScenarios` array:
```javascript
{
  category: 'Your Category',
  input: 'Your test input',
  expectedType: 'expected-response-type',
  expectedCount: 'expected-item-count',
  description: 'What should happen'
}
```

### Adding New Mock Data
1. Edit `scripts/seed-comprehensive-test-data.js`
2. Add data to appropriate section (venues, players, sessions)
3. Ensure data supports your test scenarios

### Modifying Validation Rules
1. Edit `scripts/validate-test-data.js`
2. Add new validation checks in appropriate functions
3. Update coverage analysis as needed

## 🐛 Troubleshooting

### Common Issues

**"No venues found"**
- Run the seeding script first
- Check database connection
- Verify environment variables

**"Tests failing unexpectedly"**
- Check if AI service is properly configured
- Verify mock data matches expected format
- Review test scenario expectations

**"Data validation errors"**
- Re-run seeding script
- Check for required field completeness
- Verify relationship consistency

### Debug Mode
Add debug logging to any script:
```javascript
console.log('Debug:', JSON.stringify(data, null, 2));
```

## 📈 Performance Considerations

### Test Data Size
- Current setup: ~30 records total
- Scales to: 100+ records without performance impact
- For larger datasets: implement pagination in queries

### Test Execution Time
- Full test suite: ~30 seconds
- Individual scenarios: ~1 second each
- Parallel execution: possible for independent tests

## 🎉 Success Criteria

### Data Quality
- ✅ All venues have required fields
- ✅ Players have realistic availability
- ✅ Sessions have proper time/date logic
- ✅ No orphaned relationships

### Scenario Coverage
- ✅ 90%+ test scenarios pass
- ✅ All edge cases handled gracefully
- ✅ Error messages are helpful
- ✅ Response times under 3 seconds

### User Experience
- ✅ Natural language understanding
- ✅ Contextual responses
- ✅ Clear action buttons
- ✅ Consistent design patterns

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the test scenario documentation
3. Validate your test data setup
4. Check AI service configuration

Remember: The goal is to ensure the AI provides helpful, accurate responses that guide users toward successful padel game bookings!