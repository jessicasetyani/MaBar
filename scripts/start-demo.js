#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎭 MaBar Dashboard Demo Launcher');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('📝 Please edit .env with your Back4App credentials for full experience');
    console.log('   Or continue for mock data demo\n');
  } else {
    console.log('❌ No .env.example found. Please create .env manually.\n');
  }
}

console.log('🚀 Starting MaBar Frontend...');
console.log('📍 URL: http://localhost:5173');
console.log('👤 Demo Account: venue@mabar.com / venue123 (if demo data generated)');
console.log('📱 Or register any new account for mock data\n');

console.log('💡 Tips:');
console.log('   • Select "Venue Owner" role during registration');
console.log('   • Complete onboarding to access dashboard');
console.log('   • Calendar shows mock data if Back4App not configured');
console.log('   • Try different calendar views (Week/Month/Day)');
console.log('   • Click bookings to see details modal');
console.log('   • Drag to block/unblock time slots\n');

console.log('🛑 Press Ctrl+C to stop the demo\n');

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'mabar-frontend'),
  stdio: 'inherit',
  shell: true
});

devProcess.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

devProcess.on('close', (code) => {
  console.log(`\n👋 Demo stopped with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping demo...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping demo...');
  devProcess.kill('SIGTERM');
});
