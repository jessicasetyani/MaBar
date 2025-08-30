/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FDE047',    // MaBar Yellow
        background: '#FEFCE8', // Light Cream
        surface: '#FFFFFF',    // White
        text: '#334155',       // Charcoal
        subtle: '#64748B',     // Slate Gray
        accent: '#84CC16'      // Padel Green
      }
    },
  },
  plugins: [],
}