# MaBar - Smart Padel Matchmaking Platform

[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-blue)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange)](https://www.rust-lang.org/)
[![Actix Web](https://img.shields.io/badge/Actix%20Web-4.x-red)](https://actix.rs/)
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

- **Frontend:** React.js 18+, CSS3, HTML5 (PWA)
- **Backend:** Rust 1.70+ with Actix Web 4.x (primary)
- **Database:** MongoDB 6.x with native Rust driver
- **AI/LLM:** Google Gemini API
- **Authentication:** JWT with OAuth 2.0 (Google, Facebook)
- **Task Management:** Task Master AI
- **Development Tools:** ESLint, Prettier, Cargo, Clippy

### User Roles

- **Player:** Pengguna utama yang mencari lapangan dan teman bermain
- **Venue Owner:** Pemilik/pengelola lapangan yang mendaftarkan venue
- **Admin:** Tim internal untuk monitoring dan analisis

## 🔐 Authentication System

### Supported Authentication Methods

- **Email/Password Registration & Login**
- **OAuth SSO**: Google and Facebook integration
- **JWT Token-based Authentication**
- **Role-based Access Control**: Player, Venue Owner, Admin

### Authentication Flow

1. **Registration/Login**: Email/password or OAuth (Google/Facebook)
2. **Role Selection**: Choose Player or Venue Owner role
3. **Onboarding**: Complete profile based on selected role
4. **Dashboard Access**: Full platform functionality

### API Endpoints

#### Authentication
- `POST /auth/register` - Email registration
- `POST /auth/login` - Email login
- `GET /auth/google` - Google OAuth redirect
- `GET /auth/facebook` - Facebook OAuth redirect
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/facebook/callback` - Facebook OAuth callback
- `POST /auth/role` - Set user role (requires JWT)
- `GET /auth/status` - Check authentication status
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout

#### Admin Authentication
- `POST /auth/admin/login` - Admin login
- `POST /auth/admin/logout` - Admin logout

## 🚀 Getting Started

### Prerequisites

- **Rust 1.70+ and Cargo** - For the primary Actix Web backend
- **Node.js 18.x or higher** - For frontend development
- **MongoDB 6.x or higher** - Database server
- **Google Gemini API key** - For AI-powered features
- **OAuth credentials** - Google and Facebook app credentials
- **Task Master AI** - For project management (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/mabar.git
   cd mabar
   ```

2. **Install Rust** (if not already installed)

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

3. **Install dependencies**

   Install frontend dependencies:
   ```bash
   npm install --prefix frontend
   ```

   Build Rust backend:
   ```bash
   cd backend-rust
   cargo build
   cd ..
   ```

4. **Environment Setup**

   Copy the example environment file and configure:
   ```bash
   cp .env.example .env
   ```

   **Centralized Configuration**: All environment variables are managed in the root `.env` file. Both frontend and backend read from this single source of truth.

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

   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d

   # App Configuration
   NODE_ENV=development

   # Backend Configuration
   BACKEND_PORT=3000
   BACKEND_HOST=127.0.0.1

   # Frontend Configuration
   FRONTEND_PORT=3001
   FRONTEND_HOST=0.0.0.0

   # Vite-specific variables
   VITE_API_BASE_URL=http://localhost:3000
   ```

5. **Database Setup** (Optional - requires MongoDB running)

   ```bash
   npm run db:setup
   ```

6. **Start Development Servers**

   Start the Rust backend:
   ```bash
   cd backend-rust
   cargo run
   ```

   In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

   This will start:
   - **Rust Backend**: `http://localhost:5000` (primary API)
   - **Frontend**: `http://localhost:5173` (React app)

### Building for Production

Build the frontend:
```bash
cd frontend
npm run build
```

Build and run the Rust backend:
```bash
cd backend-rust
cargo build --release
cargo run --release
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
- **Completed**: 6 tasks (46% complete)
  - ✅ Task #1: Project Setup and Infrastructure
  - ✅ Task #2: Admin Panel Foundation and Venue Verification Queue
  - ✅ Task #3: Venue Onboarding Flow for Venue Owners
  - ✅ Task #11: Generate Secure Secrets and Environment Management
  - ✅ Task #12: Backend Migration to Rust with Actix Web
  - ✅ Task #13: Validate Completed Features After Rust Migration
- **In Progress**: 1 task
  - 🔄 Task #4: User Authentication and Profile Management (6/8 subtasks done)
- **Pending**: 6 tasks ready for development
  - 🔄 Task #5: Venue Dashboard with Calendar View
  - 🔄 Task #6: Game Session Management for Players
  - 🔄 Task #7: QR Code Generation for Bookings
  - 🔄 Task #8: QR Code Check-in Functionality
  - 🔄 Task #9: Reputation and Trust System
  - 🔄 Task #10: AI Chat Interface with Google Gemini

#### Recently Completed: Task #4 - User Authentication (6/8 subtasks)
- ✅ 4.1: MongoDB User Schema with roles and profiles
- ✅ 4.2: Email/password registration and login endpoints
- ✅ 4.3: OAuth SSO integration (Google & Facebook)
- ✅ 4.6: Frontend registration and login forms with React Hook Form
- ✅ 4.7: Frontend role selection component
- 🔄 4.4: Role selection endpoint (pending)
- 🔄 4.5: JWT authentication middleware (pending)
- 🔄 4.8: Player profile management (pending)

#### Subtask Progress: 39/53 completed (74% subtask completion)

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
├── backend-rust/           # Rust + Actix Web backend (primary)
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

- `npm run dev` - Start frontend development server only (legacy script)
- `npm run build` - Build frontend for production
- `npm run test` - Run frontend tests
- `npm run lint` - Run ESLint on frontend
- `npm run lint:fix` - Auto-fix ESLint issues on frontend
- `npm run format` - Format code with Prettier on frontend
- `npm run format:check` - Check code formatting on frontend
- `npm run db:setup` - Setup MongoDB database with collections and indexes
- `npm run generate-secrets` - Generate secure JWT and session secrets

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

- `npm run dev` - Start Vite development server (<http://localhost:5173>)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

**Rust Backend (cd backend-rust) - PRIMARY:**

- `cargo run` - Start Rust backend development server (<http://localhost:5000>)
- `cargo build --release` - Build for production
- `cargo check` - Check code without building
- `cargo test` - Run tests
- `cargo clippy` - Run linter
- `cargo fmt` - Format code

### API Documentation

API endpoints are available at:

- Health check: `${BACKEND_URL}/api/health` (Rust backend)
- Database health: `${BACKEND_URL}/api/db-health`
- Authentication: `${BACKEND_URL}/auth/*`
- Profile endpoints: `${BACKEND_URL}/api/profile/*`
- Venue endpoints: `${BACKEND_URL}/api/venues/*`
- Admin endpoints: `${BACKEND_URL}/api/admin/*`

**Note:** Replace `${BACKEND_URL}` with your actual backend URL from environment variables (default: `http://localhost:5000`)

#### Key API Endpoints

**Authentication:**

- `GET /auth/status` - Check authentication status
- `POST /auth/login` - Email/password login
- `GET /auth/google` - Google OAuth
- `GET /auth/facebook` - Facebook OAuth

**Venues:**

- `POST /api/venues` - Submit new venue for review
- `GET /api/venues` - List venues (with filtering)
- `GET /api/venues/{id}` - Get specific venue details
- `PATCH /api/venues/{id}/status` - Update venue status (admin only)

## 🎮 User Journey

### For Players

1. **Registration:** Email/password or OAuth (Google/Facebook)
2. **Role Selection:** Choose "Player" role
3. **Onboarding:** Complete skill assessment and preferences
4. **Discovery:** Use AI chat or manual search to find sessions
5. **Booking:** Join or create sessions, confirm booking
6. **Play:** Check-in via QR code, play, rate experience
7. **Social:** Follow players, join groups, track progress

### For Venue Owners

1. **Registration:** Email/password or OAuth (Google/Facebook)
2. **Role Selection:** Choose "Venue Owner" role
3. **Venue Setup:** Register venue with details and photos
4. **Admin Review:** Wait for admin approval of venue
5. **Management:** Monitor bookings and generate QR codes
6. **Analytics:** View occupancy stats and reviews
7. **Optimization:** Adjust pricing and availability

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

- **[Rust Migration Guide](docs/RUST_MIGRATION.md)** - Complete migration guide from Node.js to Rust
- **[Rust Backend README](backend-rust/README.md)** - Rust backend documentation and API reference
- **[Task Management Guide](docs/TASK_MANAGEMENT.md)** - Complete guide to our AI-powered task system
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project
- **[Security Documentation](docs/SECURITY.md)** - Security practices and guidelines

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
- ✅ User authentication and profile management
- ✅ Role-based access control
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
