# MaBar Portfolio Project Setup

This document outlines the setup and configuration for the MaBar portfolio project, designed for local development and demonstration purposes.

## Project Overview

MaBar is a Progressive Web Application (PWA) for smart Padel matchmaking, built as a portfolio project to demonstrate full-stack development skills.

## Technology Stack

- **Frontend**: React 18+ with Vite
- **Backend**: Node.js 18+ with Express 4.x
- **Database**: MongoDB with Mongoose 6.x
- **AI Integration**: Google Gemini API
- **Authentication**: OAuth 2.0 (Google, Facebook, Apple)
- **Code Quality**: ESLint + Prettier for both frontend and backend

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local installation or Docker)
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd mabar

# Install all dependencies
npm run install

# Setup environment variables
cp .env.example .env
# Edit .env with your local configuration

# Setup database (optional - requires MongoDB running)
npm run db:setup

# Start development servers
npm run dev
```

### Available Scripts

#### Development
- `npm run dev` - Start both frontend and backend development servers
- `npm run db:setup` - Setup MongoDB database with collections and indexes

#### Code Quality
- `npm run lint` - Run ESLint on both frontend and backend
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

#### Portfolio Demo
- `npm run portfolio:demo` - Build and start the application in production-like mode for demonstration

## Project Structure

```
mabar/
├── frontend/               # React.js frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── eslint.config.js    # Frontend ESLint config
│   ├── .prettierrc        # Frontend Prettier config
│   └── package.json
├── backend/                # Node.js + Express backend
│   ├── config/
│   ├── eslint.config.js    # Backend ESLint config
│   ├── .prettierrc.js     # Backend Prettier config
│   ├── server.js
│   └── package.json
├── scripts/                # Setup and utility scripts
├── .env.example           # Environment template
├── package.json           # Root package.json (workspace)
└── README.md
```

## Development Workflow

1. **Start Development**: `npm run dev`
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

2. **Code Quality**: Run linting and formatting before commits
   ```bash
   npm run lint:fix
   npm run format
   ```

3. **Database**: Ensure MongoDB is running locally for full functionality

## Portfolio Demonstration

This project showcases:
- Modern React development with Vite
- RESTful API design with Express.js
- MongoDB integration with Mongoose
- OAuth 2.0 authentication implementation
- AI integration with Google Gemini
- Code quality tools (ESLint + Prettier)
- Monorepo project structure
- Environment configuration management

## Notes

- This is a portfolio/demonstration project designed for local development only
- No external deployment or production hosting is configured
- All configurations are optimized for local development and demonstration purposes
