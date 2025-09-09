# MaBar AI Chat Test Scenarios & User Stories

## Overview
Comprehensive test cases for the MaBar AI matchmaking system covering various user inputs, edge cases, and expected AI responses.

---

## 1. SUCCESSFUL MATCH SCENARIOS

### 1.1 Perfect Match Found
**User Input:** "I want to play padel tonight at 7 PM in Senayan"
**Expected AI Response:** 
- Show 2-3 existing sessions with available slots
- Include venue details, time, cost, current players
- Provide "Join Session" buttons

**Mock Data Needed:**
- Active sessions at Senayan venues for tonight 7-8 PM
- Sessions with 1-2 open slots
- Player profiles with skill levels

### 1.2 Multiple Options Available
**User Input:** "Find me a game tomorrow morning"
**Expected AI Response:**
- Show multiple time slots (8 AM, 9 AM, 10 AM)
- Different venues with availability
- Mix of existing sessions and "Create New" options

### 1.3 Skill-Based Matching
**User Input:** "Looking for intermediate players this weekend"
**Expected AI Response:**
- Filter sessions by skill level
- Show player profiles in sessions
- Highlight skill compatibility

---

## 2. NO MATCH SCENARIOS

### 2.1 No Available Sessions
**User Input:** "I want to play at 3 AM tonight"
**Expected AI Response:**
- "No sessions found for your requested time"
- Suggest alternative times (evening slots)
- Offer to create new session
- Show popular time slots

**Mock Data Needed:**
- No sessions scheduled for 3 AM
- Popular time alternatives (6-8 PM)

### 2.2 Fully Booked Venues
**User Input:** "Book court at Jakarta Padel Center tomorrow 6 PM"
**Expected AI Response:**
- "Jakarta Padel Center is fully booked at 6 PM"
- Suggest nearby venues with availability
- Offer different time slots at same venue
- Show waiting list option

### 2.3 No Players in Area
**User Input:** "Find players in Bogor tonight"
**Expected AI Response:**
- "No active players found in Bogor area"
- Suggest expanding search to nearby areas
- Offer to create session and invite players
- Show popular areas with active players

### 2.4 Nearby Alternatives (Smart Location Suggestions)
**User Input:** "Play padel tonight 7 PM at Senayan"
**Expected AI Response:** (When Senayan is fully booked)
- "Senayan venues are fully booked at 7 PM tonight"
- "I found available courts nearby:"
- Show Menteng venue (5 min from Senayan)
- Show Kemang venue (10 min from Senayan)
- Include travel time and directions
- Highlight "Close to your preferred location"

**Mock Data Needed:**
- Senayan venues fully booked at 7 PM
- Nearby venues (Menteng, Kemang) with availability
- Distance/travel time data between areas

---

## 3. VENUE LISTING SCENARIOS

### 3.1 List All Venues
**User Input:** "Show me all padel courts in Jakarta"
**Expected AI Response:**
- Display 5-8 venue cards
- Include name, location, rating, price range
- Show availability status
- Provide "View Details" or "Book Now" options

### 3.2 Area-Specific Venues
**User Input:** "What courts are available in Kemang?"
**Expected AI Response:**
- Filter venues by Kemang area
- Show 2-3 venues with details
- Include distance/travel time
- Highlight special features

### 3.3 Price-Based Filtering
**User Input:** "Show me cheap courts under 150k per hour"
**Expected AI Response:**
- Filter venues by price range
- Sort by price (lowest first)
- Show value-for-money recommendations
- Include facility comparisons

---

## 4. PLAYER LISTING SCENARIOS

### 4.1 Available Players
**User Input:** "Who's looking to play tonight?"
**Expected AI Response:**
- Show 4-6 player profiles
- Include skill level, preferred time, location
- Show "Invite to Game" buttons
- Group by skill level or area

### 4.2 Skill-Specific Players
**User Input:** "Find advanced players for doubles"
**Expected AI Response:**
- Filter by skill level (advanced)
- Show players available for doubles
- Include recent game history
- Highlight compatibility scores

### 4.3 No Players Available
**User Input:** "Any beginners want to play at midnight?"
**Expected AI Response:**
- "No beginner players available at midnight"
- Suggest better times for beginners
- Offer to post in community board
- Show when beginners are typically active

---

## 5. GAME MATCHING SCENARIOS

### 5.1 Create New Game
**User Input:** "I want to organize a game for 4 people tomorrow"
**Expected AI Response:**
- Show "Create New Session" card
- Suggest optimal venues and times
- Estimate costs and duration
- Provide booking flow

### 5.2 Join Existing Game
**User Input:** "Can I join any game happening now?"
**Expected AI Response:**
- Show currently active sessions with open slots
- Include real-time availability
- Show distance from user location
- Provide instant join options

### 5.3 Skill Mismatch Warning
**User Input:** "I'm a beginner, can I join the advanced game at Elite Club?"
**Expected AI Response:**
- Warn about skill level difference
- Suggest beginner-friendly alternatives
- Offer to contact organizer for approval
- Show beginner sessions available

---

## 6. EDGE CASES & ERROR HANDLING

### 6.1 Typos and Misspellings
**User Input:** "Find crts in snayan tmrw"
**Expected AI Response:**
- Interpret as "Find courts in Senayan tomorrow"
- Show understanding: "I found courts in Senayan for tomorrow"
- Provide relevant results
- Ask for confirmation if unclear

### 6.2 Single Character/Word Input
**User Input:** "a" or "play"
**Expected AI Response:**
- "I need more details to help you"
- Provide guided questions
- Show quick action buttons
- Suggest complete phrases

### 6.3 Ambiguous Requests
**User Input:** "Book something"
**Expected AI Response:**
- Ask clarifying questions
- "What would you like to book?"
- Provide options: court, join game, create session
- Show popular current options

### 6.4 Invalid Locations
**User Input:** "Find courts in New York"
**Expected AI Response:**
- "MaBar currently serves Jakarta area only"
- Show available Jakarta locations
- Suggest expanding to user's area in future
- Provide Jakarta alternatives

### 6.5 Invalid Times
**User Input:** "Book court for yesterday"
**Expected AI Response:**
- "I can't book courts for past dates"
- Suggest today or future dates
- Show available time slots
- Offer calendar picker

### 6.6 Nonsensical Input
**User Input:** "Purple elephant dancing salsa"
**Expected AI Response:**
- "I didn't understand that request"
- "I help with padel court bookings and player matching"
- Show example valid requests
- Provide quick action buttons

---

## 7. CONVERSATION FLOW SCENARIOS

### 7.1 Multi-Step Booking
**User:** "I want to play padel"
**AI:** "Great! When would you like to play?"
**User:** "Tomorrow evening"
**AI:** "What area do you prefer?"
**User:** "Senayan"
**AI:** Shows available options in Senayan for tomorrow evening

### 7.2 Preference Learning
**User:** "Find me a game"
**AI:** "Based on your previous games, you prefer Kemang area and intermediate level. Here are matches for you..."
**User:** "Actually, I want to try advanced level"
**AI:** Updates preferences and shows advanced level games

### 7.3 Follow-up Questions
**User:** "Show me courts"
**AI:** Shows venue list
**User:** "What about the second one?"
**AI:** Shows detailed info about the second venue from previous list

---

## 8. SPECIAL FEATURES TESTING

### 8.1 Real-time Updates
**User Input:** "Is Jakarta Padel Center available now?"
**Expected AI Response:**
- Check real-time availability
- Show current court status
- Provide immediate booking option
- Update if status changes

### 8.2 Weather Integration
**User Input:** "Can I play outdoor courts today?"
**Expected AI Response:**
- Check weather conditions
- Recommend indoor/outdoor based on weather
- Show weather-appropriate venues
- Suggest alternative times if needed

### 8.3 Group Size Handling
**User Input:** "I have 6 people, need 2 courts"
**Expected AI Response:**
- Understand group size requirements
- Find venues with multiple courts available
- Calculate total costs
- Coordinate simultaneous bookings

---

## 9. LANGUAGE VARIATIONS

### 9.1 Bahasa Indonesia
**User Input:** "Cari lapangan padel di Jakarta Selatan"
**Expected AI Response:** (In Bahasa Indonesia)
- Show South Jakarta venues
- Respond in same language
- Maintain cultural context

### 9.2 Mixed Language
**User Input:** "Find court di Senayan untuk besok"
**Expected AI Response:**
- Understand mixed language input
- Respond in user's preferred language
- Show relevant results

---

## 10. ADVANCED EDGE CASES & SMART AI

### 10.1 Skill Level Mismatch Warning
**User Input:** "I'm a beginner, can I join the advanced game at Elite Club?"
**Expected AI Response:**
- Show the advanced session with warning
- "⚠️ Skill level mismatch detected"
- Suggest beginner-friendly alternatives
- Offer "Contact organizer" option

### 10.2 Weather-Based Intelligence
**User Input:** "Play outdoor courts today"
**Expected AI Response:** (During rainy weather)
- "Weather shows rain today, recommending indoor venues"
- Show only indoor courts
- Explain weather-based decision
- Offer outdoor alternatives for tomorrow

### 10.3 Peak Time Intelligence
**User Input:** "Play tonight" (Friday 7 PM)
**Expected AI Response:**
- Show available sessions
- "⏰ Peak time - sessions fill quickly"
- Suggest booking urgency
- Show off-peak alternatives

### 10.4 Group Size Intelligence
**User Input:** "Need courts for 8 people"
**Expected AI Response:**
- Search venues with 2+ courts available
- Calculate total costs automatically
- Show staggered time options if needed
- Highlight group packages

### 10.5 Budget Intelligence with Alternatives
**User Input:** "Cheap courts under 150k"
**Expected AI Response:** (When no budget options available)
- "No venues under 150k available"
- "Best value options nearby:"
- Show 160k-170k venues with "Best Value" tag
- Suggest off-peak pricing

### 10.6 Last-Minute Booking Intelligence
**User Input:** "Play now" (current time)
**Expected AI Response:**
- Show only immediate availability
- Include travel time calculations
- "⚡ Immediate booking required"
- Prioritize closest venues

### 10.7 Equipment & Facilities Intelligence
**User Input:** "Need equipment rental and showers"
**Expected AI Response:**
- Filter venues with required facilities
- Show facility icons/tags
- Include rental costs in pricing
- Highlight premium facility venues

### 10.8 Multi-Level Fallback Logic
**User Input:** "Play at Senayan tonight 7 PM"
**Expected AI Logic Flow:**
1. Search Senayan → Fully booked
2. Search nearby (15 min) → Show alternatives
3. If no nearby → Search different times
4. If no times → Search tomorrow
5. If nothing → Show "No Match" with full explanation

### 10.9 Transparent Decision Making
**User Input:** Any search request
**Expected AI Response:**
- Explain search logic: "Searched Senayan area, then expanded to nearby venues"
- Show confidence levels: "High match quality"
- Provide reasoning for recommendations

### 10.10 Proactive Problem Solving
**User Input:** "Book Jakarta Padel Center tomorrow 6 PM"
**Expected AI Response:** (When fully booked)
- "Jakarta Padel Center is fully booked at 6 PM"
- "I checked nearby venues and different times"
- Show 3 alternative solutions
- Offer waitlist with probability estimate

---

## 11. PERSONAL BOOKING MANAGEMENT

### 11.1 Check My Bookings
**User Input:** "What are my upcoming bookings?"
**Expected AI Response:**
- Show user's confirmed bookings
- Include date, time, venue, cost
- Show "Modify" and "Cancel" options
- Highlight bookings within 24 hours

### 11.2 Booking History
**User Input:** "Show my past games" or "My booking history"
**Expected AI Response:**
- Display recent completed sessions
- Show venues played, partners, ratings
- Include statistics (games played, favorite venues)
- Suggest "Book Again" for favorite venues

### 11.3 Booking Status Check
**User Input:** "Is my booking for tomorrow confirmed?"
**Expected AI Response:**
- Check specific booking status
- Show confirmation details
- Alert if any issues (payment pending, venue changes)
- Provide contact info if needed

### 11.4 Modify Existing Booking
**User Input:** "Change my booking from 7 PM to 8 PM"
**Expected AI Response:**
- Identify which booking to modify
- Check availability for new time
- Show modification options
- Calculate any price differences

---

## 12. AI PERSONALIZED RECOMMENDATIONS

### 12.1 Smart Recommendations Based on Profile
**User Input:** "Recommend me a game" or "What should I play?"
**Expected AI Response:**
- Analyze user's skill level, preferred areas, playing history
- "Based on your intermediate level and Kemang preference..."
- Show 2-3 personalized session recommendations
- Include compatibility scores with other players

### 12.2 Time-Based Smart Suggestions
**User Input:** "I'm free this weekend, any suggestions?"
**Expected AI Response:**
- Check user's typical playing patterns
- "You usually play Saturday mornings. Here are great options:"
- Show weekend sessions matching user preferences
- Highlight popular weekend time slots

### 12.3 Skill Development Recommendations
**User Input:** "Help me improve my game"
**Expected AI Response:**
- Suggest sessions with slightly higher skill levels
- Show venues with coaching available
- Recommend training sessions or clinics
- Connect with mentor players

### 12.4 Social Matching Recommendations
**User Input:** "Find me regular playing partners"
**Expected AI Response:**
- Analyze user's playing schedule and preferences
- Show players with similar availability
- Highlight compatibility factors (skill, location, time)
- Suggest forming a regular group

### 12.5 Venue Discovery Recommendations
**User Input:** "Suggest new venues to try"
**Expected AI Response:**
- Show venues user hasn't played at
- Filter by user's preferred areas and budget
- Highlight special features or promotions
- Include user reviews and ratings

### 12.6 Weather-Based Proactive Suggestions
**User Input:** "What should I do today?"
**Expected AI Response:** (Check weather automatically)
- "Perfect weather for outdoor courts today!"
- Recommend outdoor venues if sunny
- Suggest indoor alternatives if rainy
- Include weather forecast context

---

## 13. PERFORMANCE SCENARIOS

### 10.1 High Load Testing
**Multiple Users:** Simultaneous requests for same venue/time
**Expected AI Response:**
- Handle concurrent requests
- Update availability in real-time
- Prevent double bookings
- Show accurate wait times

### 10.2 Slow Response Handling
**User Input:** Any request during system slowdown
**Expected AI Response:**
- Show "AI is thinking..." indicator
- Provide progress updates if needed
- Timeout gracefully after 30 seconds
- Offer retry option

---

## Expected AI Response Patterns

### Successful Responses Should Include:
- Clear acknowledgment of user request
- Relevant data presentation
- Action buttons (Join, Book, Create)
- Alternative suggestions
- Next step guidance

### Error Responses Should Include:
- Polite explanation of issue
- Suggested alternatives
- Guidance for better requests
- Quick action buttons
- Help options

### No-Match Responses Should Include:
- Clear explanation of why no matches found
- Alternative suggestions (time, location, skill level)
- Option to create new session
- Popular alternatives
- Modify search options

---

## Mock Data Requirements Summary

1. **Venues:** 8-10 venues across Jakarta areas
2. **Sessions:** 20-30 active sessions at various times
3. **Players:** 15-20 player profiles with different skill levels
4. **Bookings:** Historical and current booking data
5. **Availability:** Real-time court availability
6. **Weather:** Mock weather data for outdoor recommendations
7. **Popular Times:** Analytics data for recommendations
8. **Skill Levels:** Beginner, Intermediate, Advanced, Professional
9. **Areas:** Senayan, Kemang, Kelapa Gading, PIK, BSD, etc.
10. **Price Ranges:** 100k-300k per hour variations