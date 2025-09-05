# MaBar Frontend

Vue.js 3 Progressive Web Application for the MaBar Padel matchmaking platform.

## Tech Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Pinia** for state management
- **Vue Router** for navigation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Copy `.env.example` to `.env` and configure your Back4App credentials:

```env
VITE_BACK4APP_APP_ID=your_app_id
VITE_BACK4APP_JAVASCRIPT_KEY=your_js_key
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── views/         # Page components
├── stores/        # Pinia state stores
├── services/      # API services
├── router/        # Vue Router config
└── config/        # App configuration
```
