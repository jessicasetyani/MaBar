# MaBar - Smart Padel Matchmaking Platform

[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-blue)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev/)

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

- Dashboard untuk venue owners
- Statistik okupansi dan jam populer
- Review dan rating management

## 🏗️ Architecture

### Tech Stack

- **Frontend:** React.js, CSS3, HTML5 (PWA)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI/LLM:** Google Gemini API
- **Authentication:** OAuth 2.0 (Google, Facebook, Apple SSO)

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
   APPLE_CLIENT_ID=your_apple_client_id
   APPLE_PRIVATE_KEY=your_apple_private_key

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
├── backend/                # Node.js + Express backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models (Mongoose)
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── utils/              # Server utilities
│   ├── config/             # Configuration files
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── scripts/                # Setup and utility scripts
├── .taskmaster/            # Task Master AI configuration
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json            # Root package.json (workspace)
└── README.md               # This file
```

### Available Scripts

**Root Level:**
- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build frontend for production
- `npm run start` - Start production backend server
- `npm run test` - Run tests for both frontend and backend
- `npm run db:setup` - Setup MongoDB database with collections and indexes

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

### API Documentation

API endpoints are available at:
- Health check: `http://localhost:5000/api/health`
- API info: `http://localhost:5000/api`

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

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [docs.mabar.app](https://docs.mabar.app)
- **Issues:** [GitHub Issues](https://github.com/your-org/mabar/issues)
- **Email:** [support@mabar.app](mailto:support@mabar.app)
- **Community:** [Discord](https://discord.gg/mabar)

## 🗺️ Roadmap

### MVP (Current Focus)

- ✅ AI-powered matchmaking and booking
- ✅ End-to-end booking flow with QR validation
- 🔄 User onboarding and profile management
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
