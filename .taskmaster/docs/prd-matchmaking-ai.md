# PRD: Chat AI Matchmaking (MaBar)

## tl;dr

Introduce a conversational AI that helps Padel players in Jakarta find and join games effortlessly. The AI will act as a “matchmaking concierge,” using natural language (English & Bahasa Indonesia) to connect players with compatible partners and available courts.

---

## Problem Statement

Players struggle with fragmented discovery (finding courts + partners), skill uncertainty, and inefficient coordination through WhatsApp. While MaBar provides structured booking, the **missing link is a seamless, human-like interaction** that guides players to the right match in seconds.

The AI chat is designed to:

* Lower the friction of searching (just “ask for a game”).
* Personalize recommendations based on skills, style, budget, and availability.
* Increase trust and reliability by ensuring commitments and transparency.

---

## Goals

### Business Goals

* Drive **higher booking volume** by making matchmaking frictionless.
* Position MaBar as a **smart, differentiated platform** (vs WhatsApp groups).
* Reduce **no-shows** by recommending reliable player groups.

### User Goals

* “I want to ask the app for a game, and quickly get options that fit my skill, schedule, and budget.”
* “I don’t want to manually browse. I just want the system to suggest matches.”

### Non-Goals

* AI chat for venue owners (explicitly out of scope).
* Complex social networking features (friends list, feeds, etc.).

---

## User Stories

1. **As a Player**, I want to type “Find me a game tonight around 7 PM in South Jakarta” and instantly see available matches.
2. **As a Player**, I want the AI to filter results by my profile preferences (skill, budget, play style).
3. **As a Player**, I want the AI to suggest **both creating and joining games** when no perfect match is found.
4. **As a Player**, I want to communicate in **English or Bahasa Indonesia** and still be understood.
5. **As a Player**, I want the AI to **summarize match details** (who’s playing, where, cost, time) before I commit.

---

## User Experience (Step-by-Step Flow)

1. **Entry Point**: Player lands on dashboard → AI chat widget is front and center.
2. **Conversation Start**:

   * Player: “Find me a game at 7 PM tonight.”
   * AI: Responds in natural tone: “Got it. You’re Intermediate, Competitive. Here are 3 games around South Jakarta tonight at 7 PM. Want to join one, or create your own?”
3. **Recommendation Presentation**:

   * List of sessions with **cards inside chat** (players, venue, cost, open slots).
4. **Decision Point**:

   * Player taps “Join Game” OR “Create New Session.”
5. **Confirmation**:

   * AI summarizes: “You’ll join Court XYZ, 7 PM, with 3 other Intermediate players. Cost: Rp 200K each. Confirm?”
6. **Commitment**:

   * Once confirmed, AI sends booking to backend → session added to user’s profile + venue dashboard.

---

## Narrative

Imagine Andre, a 29-year-old Intermediate player who just got off work at 6 PM. He wants to play but doesn’t have a partner. Instead of spamming his WhatsApp groups, he opens MaBar and types:

> “Cari game jam 7 di Kemang.”

Within seconds, the AI suggests three matches at his skill level nearby. He joins one, confirms in-app, and by 7 PM he’s on the court playing with vetted players. The entire flow took less than 2 minutes — no messy coordination, no uncertainty.

This experience builds **trust and stickiness**, making MaBar not just a booking app but the **default way Padel players organize their games**.

---

## Success Metrics

* **Engagement**: % of players who use chat vs. manual search.
* **Conversion**: % of chat sessions that result in confirmed bookings.
* **Retention**: Repeat booking rate among AI chat users.
* **Operational**: Drop in no-shows from AI-suggested matches.

---

## Technical Considerations

* **Frontend**:

  * Vue.js chat interface styled with Tailwind.
  * Reusable chat bubble + card components.
* **Backend (Back4App)**:

  * Cloud Code handles API calls to Gemini (no direct key exposure).
  * AI parses both English + Bahasa.
  * Scheduled job enforces “commitment deadlines” for games.
* **AI Integration**:

  * Gemini for natural language understanding.
  * Custom parsing layer ensures structured output (date, time, skill, venue).
* **Edge Cases**:

  * No matches available → AI prompts to create new game.
  * Ambiguous queries (“Find me something later”) → AI asks clarifying questions.

---

## Milestones & Sequencing

1. **Week 1–2**: Build conversational UI + integrate basic Gemini API call.
2. **Week 3–4**: Implement structured parsing → convert AI output into search filters.
3. **Week 5–6**: Connect chat flow to session creation/joining.
4. **Week 7–8**: Multi-language support (English + Bahasa).
5. **Week 9–10**: Testing + rollout (engagement & booking conversion tracking).

---
