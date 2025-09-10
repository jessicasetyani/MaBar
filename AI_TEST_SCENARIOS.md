# MaBar AI Chat Test Scenarios & User Stories

## Overview
Comprehensive test cases for the MaBar AI matchmaking system organized by complexity levels.

---

## **Level 1: Simple (0 Negotiation Rounds)**

### 1.1 Perfect Match Found
**User Input:** "I want to play padel tonight at 7 PM in Senayan"
**Expected AI Response:**
- Show 2-3 existing sessions with available slots
- Include venue details, time, cost, current players
- Provide "Join Session" buttons
**Mock Data Needed:** Active sessions at Senayan venues for tonight 7-8 PM
**AI Negotiation:** 0 rounds - Quick consensus
**Response Time:** < 2 seconds

### 1.2 List All Venues
**User Input:** "Show me all padel courts in Jakarta"
**Expected AI Response:**
- Display venue cards with name, location, rating, price range
- Show availability status
- Provide "View Details" or "Book Now" options
**Mock Data Needed:** 3 venues (Kedoya, Senayan, Plaza Indonesia)
**AI Negotiation:** 0 rounds - Direct response
**Response Time:** < 2 seconds

### 1.3 Basic Greeting
**User Input:** "Hello"
**User Story:** As a new user, I want to be greeted warmly so I feel welcome to use the app
**Expected AI Response:**
- Friendly greeting response
- Offer help with padel bookings
- Show quick action buttons
**Mock Data Needed:** None
**AI Negotiation:** 0 rounds - Immediate response
**Response Time:** < 1 second

### 1.4 Simple Question
**User Input:** "What is padel?"
**User Story:** As someone new to padel, I want to learn what the sport is about
**Expected AI Response:**
- Brief explanation of padel sport
- Mention court booking services
- Offer to help find courts
**Mock Data Needed:** None
**AI Negotiation:** 0 rounds - Direct answer
**Response Time:** < 2 seconds

### 1.5 Venue Information
**User Input:** "Tell me about Kedoya Padel Club"
**User Story:** As a player, I want specific venue details to decide if it suits my needs
**Expected AI Response:**
- Show venue details (location, price, facilities)
- Display availability status
- Provide "Book Now" button
**Mock Data Needed:** Kedoya Padel Club details
**AI Negotiation:** 0 rounds - Direct information
**Response Time:** < 2 seconds

---

## **Level 2: Medium (1-2 Negotiation Rounds)**

### 2.1 Incomplete Information
**User Input:** "Find me a game tomorrow morning"
**Expected AI Response:**
- Ask for location preference
- Show multiple time slots (8 AM, 9 AM, 10 AM)
- Mix of existing sessions and "Create New" options
**Mock Data Needed:** Morning sessions at various venues
**AI Negotiation:** 1-2 rounds - Information gathering
**Response Time:** < 4 seconds

### 2.2 Price-Based Filtering
**User Input:** "Show me cheap courts under 150k per hour"
**Expected AI Response:**
- Filter venues by price range
- Sort by price (lowest first)
- Show value-for-money recommendations
**Mock Data Needed:** Venues with varied pricing (180k-300k)
**AI Negotiation:** 1 round - Clarify budget if no matches
**Response Time:** < 3 seconds

### 2.3 Skill-Based Matching
**User Input:** "Looking for intermediate players this weekend"
**User Story:** As an intermediate player, I want to find players at my skill level for competitive games
**Expected AI Response:**
- Filter sessions by skill level
- Show player profiles in sessions
- Ask for specific day/time preference
**Mock Data Needed:** Players with different skill levels
**AI Negotiation:** 1-2 rounds - Time clarification
**Response Time:** < 4 seconds

### 2.4 Time Preference
**User Input:** "I want to play tomorrow evening"
**User Story:** As a working professional, I want to find games that fit my evening schedule
**Expected AI Response:**
- Ask for location preference
- Show evening time slots (6 PM, 7 PM, 8 PM)
- Display available venues for evening play
**Mock Data Needed:** Evening sessions at various venues
**AI Negotiation:** 1 round - Location clarification
**Response Time:** < 3 seconds

### 2.5 Player Search
**User Input:** "Find players for doubles"
**User Story:** As someone looking for a doubles partner, I want to find compatible players
**Expected AI Response:**
- Ask for skill level preference
- Ask for preferred time/date
- Show available players for doubles
**Mock Data Needed:** Player profiles with availability
**AI Negotiation:** 2 rounds - Skill and time clarification
**Response Time:** < 4 seconds

---

## **Level 3: Complex (2-3 Negotiation Rounds)**

### 3.1 Multi-Step Bookings
**User Input:** "Find me a court tomorrow, then help me invite players"
**Expected AI Response:**
- Find available courts first
- Present court options with "Select" buttons
- After selection, transition to player invitation
- Show compatible players for selected time/venue
**Mock Data Needed:** Courts and players with availability
**AI Negotiation:** 2-3 rounds - Multi-step coordination
**Response Time:** < 6 seconds

### 3.2 Context Switching
**User Input:** "Find me a court tomorrow at 7pm" → "Actually, change that to next week"
**Expected AI Response:**
- Detect context change
- Update search parameters
- Show new results for next week
**Mock Data Needed:** Availability for multiple dates
**AI Negotiation:** 2 rounds - Context update negotiation
**Response Time:** < 5 seconds

### 3.3 Error Recovery
**User Input:** "Find crts in snayan tmrw"
**Expected AI Response:**
- Interpret as "Find courts in Senayan tomorrow"
- Show understanding: "I found courts in Senayan for tomorrow"
- Provide relevant results
**Mock Data Needed:** Senayan venues
**AI Negotiation:** 2 rounds - Error correction and confirmation
**Response Time:** < 4 seconds

### 3.4 No Match with Alternatives
**User Input:** "I want to play at 3 AM tonight"
**User Story:** As a night shift worker, I want to find games during unusual hours or get helpful alternatives
**Expected AI Response:**
- "No sessions found for your requested time"
- Suggest alternative times (evening slots)
- Offer to create new session
**Mock Data Needed:** No 3 AM sessions, popular alternatives
**AI Negotiation:** 2-3 rounds - Alternative suggestions
**Response Time:** < 5 seconds

### 3.5 Ambiguous Request
**User Input:** "Book something for tomorrow"
**User Story:** As a casual user, I want the AI to help clarify my vague requests
**Expected AI Response:**
- Ask clarifying questions: "What would you like to book?"
- Provide options: court, join game, create session
- Show popular current options
**Mock Data Needed:** Popular sessions and venues
**AI Negotiation:** 2-3 rounds - Clarification process
**Response Time:** < 5 seconds

---

## **Level 4: Very Complex (3+ Negotiation Rounds)**

### 4.1 Skill Mismatch Intelligence
**User Input:** "I'm a beginner, can I join the advanced game at Elite Club?"
**Expected AI Response:**
- Show the advanced session with warning
- "⚠️ Skill level mismatch detected"
- Suggest beginner-friendly alternatives
- Offer "Contact organizer" option
**Mock Data Needed:** Advanced sessions, beginner alternatives
**AI Negotiation:** 3+ rounds - Risk assessment and alternatives
**Response Time:** < 8 seconds

### 4.2 Group Size Intelligence
**User Input:** "Need courts for 8 people"
**Expected AI Response:**
- Search venues with 2+ courts available
- Calculate total costs automatically
- Show staggered time options if needed
- Highlight group packages
**Mock Data Needed:** Multi-court venues
**AI Negotiation:** 3+ rounds - Complex logistics coordination
**Response Time:** < 10 seconds

### 4.3 Budget Intelligence with Alternatives
**User Input:** "Cheap courts under 150k"
**Expected AI Response:** (When no budget options available)
- "No venues under 150k available"
- "Best value options nearby:"
- Show 160k-170k venues with "Best Value" tag
- Suggest off-peak pricing
**Mock Data Needed:** Venues above budget range
**AI Negotiation:** 3+ rounds - Budget negotiation and alternatives
**Response Time:** < 8 seconds

### 4.4 Nonsensical Input Recovery
**User Input:** "Purple elephant dancing salsa"
**User Story:** As a user who made a mistake or is testing the system, I want helpful guidance to get back on track
**Expected AI Response:**
- "I didn't understand that request"
- "I help with padel court bookings and player matching"
- Show example valid requests
- Provide quick action buttons
**Mock Data Needed:** None
**AI Negotiation:** 3+ rounds - Error recovery and guidance
**Response Time:** < 6 seconds

### 4.5 Complex Scheduling
**User Input:** "I have 6 friends with different skill levels, help organize sessions"
**User Story:** As a group organizer, I want to coordinate multiple players with varying abilities
**Expected AI Response:**
- Ask about skill levels of each friend
- Suggest splitting into skill-matched groups
- Find multiple courts or time slots
- Calculate costs for group booking
**Mock Data Needed:** Multiple venues, varied skill sessions
**AI Negotiation:** 3+ rounds - Complex group coordination
**Response Time:** < 10 seconds

### 4.6 Budget Optimization
**User Input:** "What's the cheapest way to play 3 hours of padel this week?"
**User Story:** As a budget-conscious player, I want to maximize playing time while minimizing costs
**Expected AI Response:**
- Analyze pricing across venues and times
- Suggest off-peak hours for better rates
- Calculate different booking combinations
- Show total costs and savings
**Mock Data Needed:** Venue pricing, time-based rates
**AI Negotiation:** 3+ rounds - Complex optimization analysis
**Response Time:** < 8 seconds

---

## 🚀 **How to Test**

```javascript
// Open MaBar app → AI Chat → Console

// Level 1: Simple
AITest.runTest("I want to play padel tonight at 7 PM in Senayan")
AITest.runTest("Hello")

// Level 2: Medium  
AITest.runTest("Find me a game tomorrow morning")
AITest.runTest("Show me cheap courts under 150k per hour")

// Level 3: Complex
AITest.runTest("Find me a court tomorrow, then help me invite players")
AITest.runTest("Find crts in snayan tmrw")

// Level 4: Very Complex
AITest.runTest("I'm a beginner, can I join the advanced game at Elite Club?")
AITest.runTest("Need courts for 8 people")

// Monitor AI negotiations
EnhancedAICommunication.getNegotiationHistory()
AIFlowLogger.printFlowSummary()
```

---

## Expected AI Response Patterns

### Level 1 (Simple):
- **Negotiation Rounds:** 0
- **Response Time:** < 2 seconds
- **Behavior:** Direct answers, immediate results

### Level 2 (Medium):
- **Negotiation Rounds:** 1-2
- **Response Time:** < 4 seconds
- **Behavior:** Ask clarifying questions, provide options

### Level 3 (Complex):
- **Negotiation Rounds:** 2-3
- **Response Time:** < 6 seconds
- **Behavior:** Multi-step planning, context switching, error recovery

### Level 4 (Very Complex):
- **Negotiation Rounds:** 3+
- **Response Time:** < 10 seconds
- **Behavior:** Advanced intelligence, complex problem-solving

---

## Mock Data Requirements Summary

1. **Venues:** 3 venues (Kedoya, Senayan, Plaza Indonesia)
2. **Sessions:** 5-10 active sessions at various times
3. **Players:** 3 player profiles with different skill levels
4. **Availability:** Real-time court availability
5. **Skill Levels:** Beginner, Intermediate, Advanced
6. **Areas:** Kedoya, Senayan, Thamrin
7. **Price Ranges:** 180k-300k per hour variations