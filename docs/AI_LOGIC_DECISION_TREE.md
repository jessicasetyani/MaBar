# MaBar AI Logic Decision Tree & Smart Fallbacks

## AI Logic Flow for Smart Alternatives

### 1. PRIMARY SEARCH
**User:** "Play padel tonight 7 PM at Senayan"

**Logic AI Decision Process:**
```
1. Search Senayan venues for 7 PM tonight
   ├─ Found available? → Show sessions
   └─ No availability? → Go to FALLBACK LEVEL 1
```

### 2. FALLBACK LEVEL 1: Nearby Locations
```
2. Search venues within 15 min of Senayan for 7 PM
   ├─ Found 2+ venues? → Show "nearby alternatives" 
   ├─ Found 1 venue? → Show single alternative + suggest time flexibility
   └─ No venues? → Go to FALLBACK LEVEL 2
```

### 3. FALLBACK LEVEL 2: Time Flexibility
```
3. Search Senayan + nearby for different times tonight
   ├─ Found sessions? → Show "different time" alternatives
   └─ No sessions? → Go to FALLBACK LEVEL 3
```

### 4. FALLBACK LEVEL 3: Date Flexibility
```
4. Search Senayan for tomorrow/weekend at 7 PM
   ├─ Found sessions? → Show "different date" alternatives
   └─ No sessions? → Go to FALLBACK LEVEL 4
```

### 5. FALLBACK LEVEL 4: Create New Session
```
5. Check if venue allows new session creation
   ├─ Available court slots? → Show "create new session"
   └─ No slots? → Go to FINAL FALLBACK
```

### 6. FINAL FALLBACK: No Match Card
```
6. Show "No Match" card with:
   - Popular times in Senayan area
   - Alternative areas with availability
   - Waitlist option
   - Community board posting
```

## Smart Edge Cases & Responsible AI Responses

### EDGE CASE 1: Partial Match with Warnings
**User:** "Beginner wants to join advanced game at Elite Club"
**Logic AI Response:**
- Show the advanced session
- Add warning card: "Skill level mismatch detected"
- Suggest beginner-friendly alternatives
- Offer "Contact organizer" option

### EDGE CASE 2: Weather-Based Intelligence
**User:** "Play outdoor courts today"
**Logic AI Checks:**
1. Weather conditions
2. If rain/storm → Only show indoor venues
3. If perfect weather → Prioritize outdoor venues
4. Add weather context in response

### EDGE CASE 3: Peak Time Intelligence
**User:** "Play tonight" (during Friday 7-8 PM peak)
**Logic AI Response:**
- Show available sessions
- Add context: "Peak time - book quickly"
- Suggest off-peak alternatives
- Show waiting list for popular venues

### EDGE CASE 4: Budget-Conscious Suggestions
**User:** "Cheap courts under 150k"
**Logic AI Response:**
- Show budget venues first
- If none available → Show slightly higher with "Best value" tag
- Suggest off-peak pricing
- Highlight group discounts

### EDGE CASE 5: Group Size Intelligence
**User:** "Need courts for 8 people" (requires 2 courts)
**Logic AI Response:**
- Search venues with 2+ available courts at same time
- If not possible → Suggest staggered times
- Show venues with group packages
- Calculate total costs automatically

### EDGE CASE 6: Skill Level Balancing
**User:** "Mixed skill group - 2 beginners, 2 advanced"
**Logic AI Response:**
- Suggest venues with coaching available
- Show "mixed skill friendly" sessions
- Recommend skill-balancing formats
- Offer separate court booking option

### EDGE CASE 7: Last-Minute Booking Intelligence
**User:** "Play now" (current time)
**Logic AI Response:**
- Show only venues with immediate availability
- Check travel time to venue
- Prioritize closest venues
- Add "Hurry - limited time" context

### EDGE CASE 8: Recurring Game Intelligence
**User:** "Weekly game every Tuesday 7 PM"
**Logic AI Response:**
- Check availability for next 4 weeks
- Show venues with consistent availability
- Offer subscription/package deals
- Highlight venues with loyalty programs

### EDGE CASE 9: Equipment & Facility Intelligence
**User:** "Need equipment rental and shower facilities"
**Logic AI Response:**
- Filter venues with equipment rental
- Show facilities available
- Include rental costs in pricing
- Highlight premium facility venues

### EDGE CASE 10: Social Preference Intelligence
**User:** "Looking for friendly, social games"
**Logic AI Response:**
- Show sessions with social/casual tags
- Filter out competitive tournaments
- Highlight venues with social areas
- Show sessions with similar-minded players

## Responsible AI Response Patterns

### 1. TRANSPARENCY IN DECISIONS
```json
{
  "text": "Senayan is fully booked, so I searched nearby areas within 15 minutes.",
  "reasoning": "expanded_search_radius",
  "alternatives_checked": ["Menteng", "Kemang", "Kuningan"],
  "sessionCards": [...]
}
```

### 2. CONFIDENCE LEVELS
```json
{
  "text": "I found 2 great matches for you:",
  "confidence": "high",
  "match_quality": {
    "location": "perfect",
    "time": "exact",
    "skill_level": "compatible"
  }
}
```

### 3. PROACTIVE WARNINGS
```json
{
  "text": "Found a session, but there's a skill level difference.",
  "warnings": ["skill_mismatch"],
  "recommendation": "consider_beginner_session",
  "sessionCards": [...]
}
```

### 4. CONTEXTUAL EXPLANATIONS
```json
{
  "text": "Peak time detected - these sessions fill up quickly.",
  "context": "friday_evening_peak",
  "urgency": "high",
  "booking_advice": "Reserve within 30 minutes"
}
```

## Advanced Logic Scenarios

### SCENARIO A: Smart Overbooking Detection
**Logic:** If venue historically has cancellations, suggest waitlist with probability
**Response:** "85% chance of availability based on typical cancellations"

### SCENARIO B: Player Compatibility Scoring
**Logic:** Match players based on skill, play style, availability overlap
**Response:** "92% compatibility with your playing preferences"

### SCENARIO C: Dynamic Pricing Intelligence
**Logic:** Detect off-peak times, suggest cost savings
**Response:** "Save 30% by playing 1 hour earlier"

### SCENARIO D: Traffic-Aware Suggestions
**Logic:** Consider Jakarta traffic patterns in recommendations
**Response:** "Kemang venue recommended - avoid Senayan traffic at this time"

### SCENARIO E: Venue Reputation Intelligence
**Logic:** Factor in venue ratings, recent reviews, maintenance status
**Response:** "Highly rated venue (4.8/5) with recently renovated courts"

## No Match Card Triggers

Show "No Match" card ONLY when ALL fallbacks fail:
1. ❌ No availability in requested area
2. ❌ No availability in nearby areas (15 min radius)
3. ❌ No availability at alternative times today
4. ❌ No availability tomorrow at requested time
5. ❌ No courts available for new session creation

**Final No Match Response:**
```json
{
  "type": "no-availability",
  "data": {
    "message": "No courts available matching your criteria",
    "alternatives_tried": [
      "Senayan area venues",
      "Nearby areas (Menteng, Kemang)",
      "Alternative times today",
      "Tomorrow same time"
    ],
    "suggestions": [
      "Join waitlist for Senayan venues",
      "Try weekend morning slots",
      "Consider Kelapa Gading area (more availability)"
    ],
    "next_available": "Tomorrow 8 AM at Jakarta Padel Center"
  }
}
```

This ensures the AI is truly intelligent and exhausts all reasonable options before showing "no match".