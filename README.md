# MaBar - Smart Padel Matchmaking Platform

[![Version](https://img.shields.io/badge/version-2.0.0--beta-blue.svg)](https://github.com/jessicasetyani/MaBar)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/vue-3.5.18-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.3-blue.svg)](https://www.typescriptlang.org/)

> **MaBar** is a Progressive Web Application (PWA) designed to be the premier smart matchmaking platform for Padel players in Jakarta. Connect players and courts through conversational AI, providing personalized recommendations and fostering a reliable community.

## 🎯 Project Overview

MaBar solves the fragmented discovery problem in Jakarta's Padel community by providing:

- **Smart Matchmaking**: AI-powered player and court recommendations
- **Unified Platform**: Single place for finding partners and booking courts
- **Quality Assurance**: Skill assessment and venue verification system
- **Reliable Community**: Commitment tracking and reputation management

### Key Features

- 🤖 **AI Chat Interface** - Client-side natural language processing with Google Gemini 2.5 Flash Lite
- 👥 **Player Profiles** - Skill assessment and preference management
- 🏟️ **Venue Management** - Direct database queries for real-time court availability
- 📱 **PWA Support** - Mobile-first responsive design
- 🔐 **Secure Authentication** - Back4App-powered user management
- ⚡ **Real-time Data** - Direct Parse database integration without cloud functions

## 🏗️ Architecture

### Frontend-First AI Architecture
- **Framework**: Vue.js 3 with TypeScript
- **Build Tool**: Vite for rapid development
- **State Management**: Pinia for reactive state
- **Styling**: Tailwind CSS with custom design system
- **AI Processing**: Google Gemini API with multi-turn conversations
- **Database**: Back4App (Parse Server) as DBaaS only
- **AI Flow**: Unified conversation manager with intelligent context accumulation

### Project Structure

```text
MaBar/
├── mabar-frontend/          # Vue.js PWA application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── views/          # Page-level components (AIChat.vue)
│   │   ├── stores/         # Pinia state management
│   │   ├── services/       # Back4App Parse SDK integration
│   │   ├── router/         # Vue Router configuration
│   │   └── config/         # Environment configuration
├── scripts/                 # Database seeding and utilities
├── .taskmaster/            # Task management and project planning
└── docs/                   # Additional documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Back4App account (for backend services)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jessicasetyani/MaBar.git
   cd MaBar
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit with your credentials
   nano .env
   ```

4. **Configure Environment Variables**

   ```env
   # .env (project root)
   VITE_BACK4APP_APP_ID=your_back4app_application_id
   VITE_BACK4APP_JAVASCRIPT_KEY=your_back4app_javascript_key
   VITE_BACK4APP_MASTER_KEY=your_back4app_master_key
   VITE_GOOGLE_API_KEY=your_gemini_api_key
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run test suite |

### Code Quality

The project enforces code quality through:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

### Design System

MaBar follows a strict color palette and design principles:

| Color | Hex | Usage |
|-------|-----|-------|
| MaBar Yellow | `#FDE047` | Primary buttons, CTAs |
| Light Cream | `#FEFCE8` | Main background |
| White | `#FFFFFF` | Cards, modals, inputs |
| Charcoal | `#334155` | Primary text |
| Slate Gray | `#64748B` | Secondary text |
| Padel Green | `#84CC16` | Success states, accents |

## 🔧 Backend Services

### Back4App Integration

MaBar uses Back4App purely as Database-as-a-Service (DBaaS) providing:

- **Database**: MongoDB-backed Parse Server
- **Authentication**: Built-in user management
- **Direct Queries**: Frontend queries database directly
- **Real-time**: Live queries and subscriptions

### Database Schema

Key collections:

- **Venue**: Court information, pricing, availability
- **PlayerProfile**: User skills, preferences, history
- **Booking**: Session bookings and scheduling
- **User**: Authentication and profile data

### Database Seeding

Add test data for development:

```bash
# Add sample venues for testing
node scripts/add-test-venues.js
```

## 🤖 AI Integration

### Conversation Flow Classes

- **AICoordinatorService**: Main entry point for all AI interactions
- **AIConversationManager**: Core multi-turn conversation logic with Google Gemini
- **AIFlowLogger**: Comprehensive logging system for debugging AI decisions

### AI Decision Process

1. **Information Gathering**: AI accumulates user preferences across multiple messages
2. **Toolbox Execution**: AI decides when to query database (venues, players, sessions)
3. **Smart Presentation**: AI analyzes results and formats appropriate UI response
4. **Context Memory**: Maintains conversation history for natural interactions

### Google Gemini API (Multi-Turn Conversations)

The AI matchmaking system uses Google Gemini 2.5 Flash Lite for:

- **Multi-turn conversations**: Proper conversation context and memory
- **Dynamic information gathering**: Intelligently accumulates user preferences
- **Smart toolbox integration**: AI decides when to query database
- **Contextual presentation**: Adapts response format based on results
- **Multi-language support**: English/Bahasa Indonesia

### AI Architecture Benefits

- **Intelligent Context**: Remembers conversation history and user preferences
- **Dynamic Decision Making**: AI thinks about what information is needed
- **Responsible AI**: Only provides data from database, no hallucinations
- **Smart Presentation**: Adapts UI based on result quantity and quality
- **Comprehensive Logging**: Full conversation flow tracking for debugging

### Security

- Environment-based API key management
- Parse ACL for database security
- Input validation and sanitization
- Rate limiting through Gemini API quotas

## 📱 User Experience

### Player Journey

1. **Registration** - Email/password authentication
2. **Role Selection** - Choose Player or Venue Owner
3. **Profile Setup** - Skill assessment and preferences
4. **AI Matchmaking** - Natural language court/partner finding
5. **Booking** - Session creation and management

### Venue Owner Journey

1. **Registration** - Business verification required
2. **Venue Setup** - Court information and scheduling
3. **Dashboard** - Booking management and analytics
4. **QR Codes** - Player check-in system

## 🔐 Security & Compliance

- Environment variable management
- Secure API key storage
- Input validation and sanitization
- Rate limiting and abuse prevention
- GDPR-compliant data handling

## 📊 Monitoring & Analytics

- SonarQube integration for code quality
- Back4App analytics dashboard
- Error tracking and logging
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

The project uses Task Master AI for project management:

```bash
# View current tasks
npm run task:list

# Get next task
npm run task:next

# Mark task complete
npm run task:done --id=<task-id>
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Vue.js team for the excellent framework
- Back4App for reliable backend services
- Google for Gemini AI capabilities
- Jakarta Padel community for inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jessicasetyani/MaBar/issues)
- **Documentation**: [Project Wiki](https://github.com/jessicasetyani/MaBar/wiki)
- **Email**: [support@mabar.app](mailto:support@mabar.app)

---

### Built with ❤️ for the Jakarta Padel Community
