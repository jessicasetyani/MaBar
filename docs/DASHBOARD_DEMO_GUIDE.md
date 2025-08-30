# 🏟️ MaBar Venue Dashboard Demo Guide

This guide will help you view the venue dashboard with realistic test data.

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Environment Variables
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your Back4App credentials
# You need:
# - VITE_BACK4APP_APP_ID
# - VITE_BACK4APP_JAVASCRIPT_KEY  
# - VITE_BACK4APP_MASTER_KEY
```

### Step 2: Generate Demo Data (Optional - for full experience)
```bash
# This creates a test venue with bookings and blocked slots
npm run db:demo-data
```

### Step 3: Start the Application
```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:5173
```

## 🎭 Demo Accounts

### Option A: With Back4App Data (Full Experience)
If you ran the demo data script:
- **Email:** `venue@mabar.com`
- **Password:** `venue123`
- **Role:** Venue Owner (auto-assigned)
- **Status:** Approved venue with live data

### Option B: Mock Data (No Back4App needed)
If you don't have Back4App configured:
- Use any email/password to register
- Select "Venue Owner" role
- Complete the onboarding flow
- The dashboard will show mock data automatically

## 📱 What You'll See

### 🏠 Dashboard Features
1. **Header**: Venue name with verification badge
2. **Navigation**: 
   - Desktop: Left sidebar
   - Mobile: Bottom navigation
3. **Three Main Tabs**:
   - 📅 Calendar & Bookings
   - 🏢 Venue Profile  
   - 📊 Analytics

### 📅 Calendar Tab (Main Feature)
- **FullCalendar Integration**: Week/Month/Day views
- **Booking Display**: 
  - Green events = Confirmed bookings
  - Yellow events = Pending bookings
  - Red events = Blocked time slots
- **Interactive Features**:
  - Click bookings to see details modal
  - Drag to select time slots for blocking
  - Click blocked slots to unblock them
- **Real-time Updates**: Changes appear instantly

### 📊 Sample Data (if using demo script)
- **7 days of bookings** with realistic player names
- **Multiple courts** (Court 1-4)
- **Different time slots** (8 AM - 10 PM)
- **Maintenance blocks** (early morning)
- **Private event blocks** (random times)
- **Mixed booking statuses** (confirmed/pending)
- **Indonesian pricing** (Rp 150,000 - 225,000)

## 🎨 Visual Features

### 🎯 Design System
- **MaBar Yellow** (#FDE047) - Primary buttons
- **Light Cream** (#FEFCE8) - Background
- **Padel Green** (#84CC16) - Success states
- **Modern Tailwind** styling throughout

### 📱 Responsive Design
- **Desktop**: Full sidebar navigation
- **Mobile**: Bottom tab navigation
- **Tablet**: Adaptive layout

### ✨ Interactions
- **Hover effects** on calendar events
- **Smooth transitions** between tabs
- **Loading states** during data fetch
- **Error handling** with user feedback

## 🔧 Troubleshooting

### No Data Showing?
1. Check browser console for errors
2. Verify environment variables in `.env`
3. The app will fall back to mock data automatically

### Calendar Not Loading?
1. Refresh the page
2. Check if you're on the Calendar tab
3. Mock data should appear even without Back4App

### Authentication Issues?
1. Try registering a new account
2. Use any email/password for testing
3. Select "Venue Owner" role during onboarding

## 🎪 Demo Scenarios

### Scenario 1: Venue Manager Daily Workflow
1. Login to dashboard
2. Check today's bookings on calendar
3. Click a booking to see customer details
4. Block a time slot for maintenance
5. Switch to different calendar views

### Scenario 2: Mobile Venue Management
1. Open on mobile device
2. Use bottom navigation tabs
3. Scroll through calendar events
4. Test touch interactions

### Scenario 3: Real-time Updates (if using Back4App)
1. Open dashboard in two browser tabs
2. Block a slot in one tab
3. Watch it appear in the other tab instantly

## 📸 Screenshots Locations

Key areas to capture for portfolio:
- **Dashboard Overview**: Full calendar with bookings
- **Booking Details Modal**: Customer information popup
- **Mobile View**: Bottom navigation and responsive layout
- **Different Calendar Views**: Week, Month, Day views
- **Interactive Features**: Slot blocking in action

## 🚀 Next Steps

After viewing the dashboard:
1. **Test all interactive features**
2. **Try different screen sizes**
3. **Check mobile responsiveness**
4. **Explore the booking details modal**
5. **Test slot blocking/unblocking**

The venue dashboard showcases modern web development with real-time features, responsive design, and professional UI/UX suitable for a production application.
