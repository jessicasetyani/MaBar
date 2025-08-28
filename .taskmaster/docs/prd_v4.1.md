<PRD>

Overview
MaBar is a Progressive Web Application (PWA) designed to be the premier smart matchmaking platform for Padel players in Jakarta. The application solves the key friction points in organizing games by connecting players with each other and with courts using a conversational AI interface. The core focus is on providing highly personalized recommendations and fostering a reliable, engaged community. It is for committed Padel players who want quality matches and for venue owners who need a simple tool to manage their court schedules and reduce no-shows.

Core Features
EPIC 1: User Onboarding & Profile Management: A comprehensive system for user registration (SSO and email), role selection (Player/Venue Owner), and detailed profile customization to power matchmaking.

EPIC 2: AI-Powered Matchmaking & Booking: A conversational AI chat (supporting English and Bahasa Indonesia) that allows players to find, create, and join game sessions using natural language.

EPIC 3: Venue Management: A dashboard for venue owners to manage their court availability, view bookings, and facilitate player check-ins.

EPIC 4: Reputation & Trust System: A system based on QR code check-ins to verify attendance, report no-shows, and allow players to rate venues after a game.

EPIC 5: Platform Administration: A secure admin panel for the internal team to manage the platform, with initial focus on verifying and approving new venue submissions.

User Experience
The application will have a clean, modern, and minimalist design with a light theme accented by bright yellow and green. The user experience must be intuitive and responsive across all devices (mobile, tablet, desktop). User flows, especially for onboarding and booking, will be streamlined to require the minimum number of steps.

Technical Architecture
System Components
Frontend: A single-page application built with React.js.

Backend: A high-performance REST API built in Rust using the Actix Web or Axum framework on the Tokio runtime.

Database: A MongoDB database to store user, venue, and game session data, accessed via the official MongoDB Rust driver.

AI Service: Integration with the Google Gemini API for the conversational matchmaking feature.

Authentication Service: OAuth 2.0 integration with Google and Facebook, implemented in Rust using the oauth2 and jsonwebtoken crates.

Data Models
User: Stores user credentials, role (player/venueOwner), and a nested profile object containing matchmaking preferences like skill level, play style, and availability.

Venue: Stores venue details, owner information, location, operating hours, and verification status.

GameSession: Stores information about a specific game, including the venue, time, required players, list of joined players with their status (e.g., 'joined', 'checked-in'), and the overall session status.

APIs and Integrations
Google Gemini API: For natural language processing and matchmaking recommendations.

Google/Facebook OAuth 2.0: For user authentication.

Internal REST API: For communication between the React frontend and the Rust backend.

Development Roadmap
Phase 1: Core Platform & User Foundation (MVP)
User Authentication & Profiles (Rust): Implement user registration (SSO/email), login, and role selection in the Rust backend. Build the API endpoints for player profile creation and updates.

Admin Panel Foundation (Rust): Create the secure admin login and the API endpoints for the venue verification queue. Admins must be able to approve or reject venues via API calls.

Venue Onboarding (Rust): Build the API endpoints for the onboarding flow for venue owners to submit their court details for verification.

Phase 2: Booking & Scheduling Engine
Venue Dashboard (Rust API): Implement the API endpoints to support the venue dashboard, allowing owners to manage their schedule and block off times.

Session Management (Rust API): Create the backend logic and API endpoints for players to create, view, and join game sessions. Implement the logic for auto-cancellation.

QR Code Generation (Rust): Generate unique QR codes for each booking on the backend, accessible via an API endpoint.

Phase 3: AI and Reputation Systems
AI Chat Integration (Rust API): Build the backend API endpoint that securely connects to the Google Gemini API to power matchmaking.

QR Code Check-in (Rust API): Implement the API endpoint to validate a QR code scan and update a player's attendance status.

Reputation System (Rust API): Add the API endpoints for players to report no-shows and rate venues after a completed game.

Logical Dependency Chain
Admin Panel & Venue Onboarding APIs: This must be built first so that there is a system for getting venues onto the platform. Without venues, players cannot book anything.

User Authentication & Profile APIs: This is the foundation for all user-specific actions. Player profiles are required before any matchmaking or booking can occur.

Session Management & Venue Dashboard APIs: These two components are co-dependent. Players need to be able to create sessions, and venue owners need to see and manage them. This forms the core booking functionality.

QR Code System APIs: The generation and validation of QR codes are prerequisites for the reputation system.

Reputation System APIs: This layer depends on users being able to book games and check in. It can only be built after the core booking loop is complete.

AI Chat Integration API: The AI matchmaking system is the final layer. It relies on having a database of verified venues and players with detailed profiles to provide accurate recommendations.

Risks and Mitigations
Technical Challenges
Risk: AI model provides inconsistent or inaccurate matchmaking results.

Mitigation: Develop robust prompt engineering and implement a feedback loop where users can refine searches. Start with simpler, deterministic filters alongside the AI.

Risk: Real-time synchronization of court availability between MaBar and a venue's offline booking system.

Mitigation: For the initial version, this is out of scope. The manual block/unblock feature is the mitigation. Future integration would require a robust API and conflict resolution logic.

MVP Definition
Risk: Scope creep, particularly with adding complex social features or payment processing too early.

Mitigation: Strictly adhere to the "Out of Scope" list. The MVP is defined as a functional platform for finding, booking, and managing games. Payments and advanced social features are post-MVP.

Resource Constraints
Risk: API costs for Google Gemini could become significant with user growth.

Mitigation: Implement caching for common queries and add rate limiting or usage quotas for the free tier of the product to manage costs effectively.

Appendix
Security & Environment Specification
All secret keys (Database URI, API Keys, SSO secrets) must be stored in a .env file and loaded via the dotenvy crate.

The .env file and the /target build directory must be included in .gitignore.

Code must be written to pass SonarQube and CodeRabbit quality gates, using rustfmt and clippy for local quality control.

</PRD>