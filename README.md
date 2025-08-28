# MaBar - Smart Padel Matchmaking Platform

[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-blue)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev/)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/jessicasetyani/MaBar?utm_source=oss&utm_medium=github&utm_campaign=jessicasetyani%2FMaBar&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🏓 Overview

MaBar adalah Progressive Web Application (PWA) yang berfungsi sebagai platform matchmaking cerdas untuk para pemain Padel. Aplikasi ini menghubungkan pemain dengan pemain lain dan dengan penyedia lapangan Padel melalui antarmuka percakapan berbasis AI (menggunakan Gemini) serta fitur sosial yang kaya.

**Tujuan:** Menjadi platform komunitas utama bagi para pemain Padel di Jakarta untuk mencari teman bermain, menjadwalkan pertandingan, memesan lapangan, dan membangun reputasi permainan mereka.

## 🎯 Key Features

### 🤖 AI-Powered Matchmaking

- **Chat AI berbasis Gemini** untuk pencarian menggunakan bahasa natural
- Memproses kriteria kompleks: skill level, usia, lokasi, jam, gender, frekuensi, histori, budget
- Rekomendasi pemain dan lapangan yang paling relevan

### 📱 End-to-End Booking System

- Alur booking yang mulus dari pencarian hingga check-in
- **QR code validation** untuk check-in di lokasi
- Notifikasi real-time untuk status booking

### ⭐ Dynamic Reputation System

- Rating dinamis untuk pemain berdasarkan ulasan dan jam terbang
- Review system untuk venue (kebersihan, kenyamanan, value)
- Badge system untuk perilaku pengguna (no-show, frequent cancellation)

### 👥 Social & Community Features

- Sinkronisasi kontak untuk menemukan teman
- Follow system dan leaderboard
- Chat personal dan grup (khusus untuk yang pernah bermain bersama)
- Sistem follower dan aktivitas feed

### 🏟️ Venue Management

- **Complete venue onboarding flow** untuk venue owners
- **Comprehensive venue submission form** dengan upload foto dan jadwal operasional
- **Admin verification queue** untuk approve/reject venue submissions
- Dashboard untuk venue owners
- Statistik okupansi dan jam populer
- Review dan rating management

## 🏗️ Architecture

### Tech Stack

- **Frontend:** React.js, CSS3, HTML5 (PWA)
- **Backend:** Rust, Actix Web (primary), Node.js, Express.js (legacy)
- **Database:** MongoDB
- **AI/LLM:** Google Gemini API
- **Authentication:** OAuth 2.0 (Google, Facebook, Apple SSO)
- **Task Management:** Task Master AI
- **Development Tools:** ESLint, Prettier, Task Master AI

### User Roles

- **Player:** Pengguna utama yang mencari lapangan dan teman bermain
- **Venue Owner:** Pemilik/pengelola lapangan yang mendaftarkan venue
- **Operations Team:** Tim internal untuk monitoring dan analisis

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- Google Gemini API key
- OAuth credentials (Google, Facebook, Apple)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/mabar.git
   cd mabar
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install dependencies for both frontend and backend.

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Configure the following environment variables in `.env`:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/mabar

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret

   # JWT
   JWT_SECRET=your_jwt_secret

   # App Configuration
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup** (Optional - requires MongoDB running)

   ```bash
   npm run db:setup
   ```

5. **Start Development Servers**

   ```bash
   npm run dev
   ```

   This will start both frontend and backend concurrently:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

### Building for Production

```bash
npm run build
npm start
```

## 📱 PWA Features

MaBar is built as a Progressive Web App with the following capabilities:

- **Offline functionality** for core features
- **Push notifications** for booking updates
- **Add to home screen** for native app-like experience
- **Responsive design** for all device sizes (mobile, tablet, desktop)

## 📋 Task Management

### Task Master AI Integration

This project uses **Task Master AI** for intelligent task management and development workflow automation. Task Master provides AI-powered task generation, complexity analysis, and progress tracking.

#### Quick Start

```bash
# View current tasks and progress
npm run task:list

# Get next available task to work on
npm run task:next

# View specific task details
npm run task:show <task-id>

# Mark task as complete
npm run task:done <task-id>
```

#### Task Management Workflow

1. **Task Generation**: Tasks are generated from PRD documents using AI
2. **Complexity Analysis**: AI analyzes task complexity and suggests subtask breakdown
3. **Dependency Management**: Automatic dependency tracking and validation
4. **Progress Tracking**: Real-time status updates and completion tracking
5. **Research Integration**: AI-powered research for complex technical decisions

#### Task Structure

- **Main Tasks**: High-level features or components (e.g., Task #1, #2, #3)
- **Subtasks**: Detailed implementation steps (e.g., Task #1.1, #1.2, #1.3)
- **Dependencies**: Automatic dependency resolution and blocking
- **Status Tracking**: `pending`, `in-progress`, `done`, `blocked`, `deferred`

#### Available Scripts

```bash
# Task Management
npm run task:list          # List all tasks with status
npm run task:next          # Get next available task
npm run task:show <id>     # Show detailed task information
npm run task:done <id>     # Mark task as completed
npm run task:add           # Add new task with AI assistance
npm run task:expand <id>   # Break task into subtasks
npm run task:analyze       # Analyze project complexity
npm run task:report        # View complexity analysis report
```

#### Task Files Location

- `.taskmaster/tasks/tasks.json` - Main task database
- `.taskmaster/tasks/` - Individual task markdown files
- `.taskmaster/docs/` - Project documentation and PRDs
- `.taskmaster/reports/` - Analysis and progress reports

#### For Contributors

1. **Check Available Tasks**: Run `npm run task:list` to see what needs work
2. **Pick Next Task**: Use `npm run task:next` to get the next priority task
3. **Review Requirements**: Use `npm run task:show <id>` for detailed requirements
4. **Update Progress**: Use task management commands to track your progress
5. **Mark Complete**: Use `npm run task:done <id>` when finished

### Current Development Status

- **Total Tasks**: 13 tasks across the project
- **Completed**: 4 tasks (31% complete)
- **In Progress**: 0 tasks
- **Pending**: 9 tasks ready for development

See `.taskmaster/tasks/tasks.json` for complete task breakdown and current status.

## 🔧 Development

### Project Structure

```text
mabar/
├── frontend/               # React.js frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services and utilities
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js + Express backend (legacy)
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models (Mongoose)
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── utils/              # Server utilities
│   ├── config/             # Configuration files
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── backend-rust/           # Rust + Actix Web backend (new)
│   ├── src/
│   │   ├── config/         # Database and configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Authentication and security
│   │   ├── models/         # Data models and schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── main.rs         # Main server entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── README.md           # Rust backend documentation
├── scripts/                # Setup and utility scripts
├── docs/                   # Project documentation
├── .taskmaster/            # Task Master AI configuration
│   ├── tasks/              # Task definitions and tracking
│   ├── docs/               # PRDs and project documentation
│   ├── reports/            # Analysis and progress reports
│   └── config.json         # Task Master configuration
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json            # Root package.json (workspace)
└── README.md               # This file
```

### Available Scripts

**Root Level:**
- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build frontend for production
- `npm run build:prod` - Build frontend for production with NODE_ENV=production
- `npm run start` - Start production backend server
- `npm run start:prod` - Start production backend server with NODE_ENV=production
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Run ESLint on both frontend and backend
- `npm run lint:fix` - Auto-fix ESLint issues on both frontend and backend
- `npm run format` - Format code with Prettier on both frontend and backend
- `npm run format:check` - Check code formatting on both frontend and backend
- `npm run db:setup` - Setup MongoDB database with collections and indexes
- `npm run generate-secrets` - Generate secure JWT and session secrets
- `npm run portfolio:demo` - Build and start the application in production-like mode for demonstration

**Task Management:**
- `npm run task:list` - List all tasks with current status
- `npm run task:next` - Get next available task to work on
- `npm run task:show <id>` - Show detailed task information
- `npm run task:done <id>` - Mark task as completed
- `npm run task:add` - Add new task with AI assistance
- `npm run task:expand <id>` - Break task into subtasks
- `npm run task:analyze` - Analyze project complexity
- `npm run task:report` - View complexity analysis report

**Frontend (cd frontend):**
- `npm run dev` - Start Vite development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

**Backend (cd backend):**
- `npm run dev` - Start backend with nodemon (http://localhost:5000)
- `npm start` - Start production backend server
- `npm run lint` - Run ESLint on backend code
- `npm run lint:fix` - Auto-fix ESLint issues on backend code
- `npm run format` - Format backend code with Prettier
- `npm run format:check` - Check backend code formatting

### API Documentation

API endpoints are available at:
- Health check: `http://localhost:3001/api/health` (Rust backend)
- Database health: `http://localhost:3001/api/db-health`
- Venue endpoints: `http://localhost:3001/api/venues`
- Admin endpoints: `http://localhost:3001/api/admin`
- Legacy Node.js API: `http://localhost:5000/api`

#### Key Venue API Endpoints
- `POST /api/venues` - Submit new venue for review
- `GET /api/venues` - List venues (with filtering)
- `GET /api/venues/{id}` - Get specific venue details
- `PATCH /api/venues/{id}/status` - Update venue status (admin only)

## 🎮 User Journey

### For Players

1. **Onboarding:** Register via SSO, complete skill assessment
2. **Discovery:** Use AI chat or manual search to find sessions
3. **Booking:** Join or create sessions, confirm booking
4. **Play:** Check-in via QR code, play, rate experience
5. **Social:** Follow players, join groups, track progress

### For Venue Owners

1. **Registration:** Register venue with details and photos
2. **Management:** Monitor bookings and generate QR codes
3. **Analytics:** View occupancy stats and reviews
4. **Optimization:** Adjust pricing and availability

## 🔒 Security & Privacy

- **OAuth 2.0** authentication for secure login
- **JWT tokens** for session management
- **Data encryption** for sensitive information
- **Privacy controls** for user data sharing
- **GDPR compliance** for data protection

## 📊 Analytics & Monitoring

- **User engagement** tracking
- **Booking conversion** metrics
- **AI interaction** analytics
- **Performance monitoring**
- **Error tracking** and reporting

## 🤝 Contributing

We welcome contributions! Please see our documentation:

- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow and standards
- **[Task Management Guide](docs/TASK_MANAGEMENT.md)** - How to work with our task system
- **[Security Documentation](docs/SECURITY.md)** - Security practices and secret management

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

- **[Task Management Guide](docs/TASK_MANAGEMENT.md)** - Complete guide to our AI-powered task system
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project
- **[Security Documentation](docs/SECURITY.md)** - Security practices and guidelines
- **[Rust Backend README](backend-rust/README.md)** - Rust backend migration documentation

## 🆘 Support

- **Documentation:** [docs.mabar.app](https://docs.mabar.app)
- **Issues:** [GitHub Issues](https://github.com/your-org/mabar/issues)
- **Email:** [support@mabar.app](mailto:support@mabar.app)
- **Community:** [Discord](https://discord.gg/mabar)

## 🗺️ Roadmap

### MVP (Current Focus)

- ✅ AI-powered matchmaking and booking
- ✅ End-to-end booking flow with QR validation
- ✅ Venue onboarding and verification system
- ✅ Admin panel with venue management
- 🔄 User authentication and profile management
- 🔄 Basic social features

### Future Releases

- 📅 Advanced scheduling and recurring bookings
- 🏆 Tournament and league management
- 💰 Payment integration
- 🌍 Multi-city expansion
- 📱 Native mobile apps

## 📈 Status

- **Current Version:** v2.0.0-beta
- **Status:** In Development
- **Target Launch:** Q2 2024
- **Coverage:** Jakarta, Indonesia

---

**Made with ❤️ for the Padel community in Jakarta**
