<template>
  <div class="min-h-screen" style="background-color: #FEFCE8;">
    <!-- Header Section -->
    <header class="px-4 py-6 md:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="md-headline-large mb-2" style="color: #334155;">
          Player Dashboard
        </h1>
        <p class="md-body-large" style="color: #64748B;">
          Find players, book courts, and manage your padel sessions
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="px-4 pb-8 md:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Action Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          <!-- Find Players Card -->
          <article 
            class="md-card group cursor-pointer transition-all duration-200 hover:shadow-md-elevation-2 focus-within:shadow-md-elevation-2" 
            @click="startMatching" 
            @keydown.enter="startMatching" 
            @keydown.space="startMatching" 
            tabindex="0" 
            role="button" 
            aria-label="Start player matching"
            style="background-color: #FFFFFF;"
          >
            <div class="p-6">
              <!-- Icon Container -->
              <div class="mb-4">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center" 
                  style="background-color: #FDE047;"
                >
                  <svg class="w-6 h-6" style="color: #334155;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-5.523-3.477-10-10-10s-10 4.477-10 10v2m10 0H7m0 0H2v-2a3 3 0 015.196-2.121M7 20v-2m5-10a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
              </div>
              
              <!-- Content -->
              <h2 class="md-title-large mb-2" style="color: #334155;">
                Find Players
              </h2>
              <p class="md-body-large mb-6" style="color: #64748B; line-height: 1.5;">
                Connect with other players for your next game
              </p>
              
              <!-- Action Button -->
              <button 
                class="md-button md-button-filled w-full min-h-[44px] touch-target focus-visible:outline-2 focus-visible:outline-offset-2" 
                style="background-color: #FDE047; color: #334155;"
                aria-label="Start matching with other players"
              >
                <span class="md-label-large font-medium">Start Matching</span>
              </button>
            </div>
          </article>

          <!-- Book Courts Card -->
          <article 
            class="md-card group cursor-pointer transition-all duration-200 hover:shadow-md-elevation-2 focus-within:shadow-md-elevation-2" 
            @click="browseCourts" 
            @keydown.enter="browseCourts" 
            @keydown.space="browseCourts" 
            tabindex="0" 
            role="button" 
            aria-label="Browse available courts"
            style="background-color: #FFFFFF;"
          >
            <div class="p-6">
              <!-- Icon Container -->
              <div class="mb-4">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center" 
                  style="background-color: #84CC16;"
                >
                  <svg class="w-6 h-6" style="color: #FFFFFF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              
              <!-- Content -->
              <h2 class="md-title-large mb-2" style="color: #334155;">
                Book Courts
              </h2>
              <p class="md-body-large mb-6" style="color: #64748B; line-height: 1.5;">
                Find and book available courts near you
              </p>
              
              <!-- Action Button -->
              <button 
                class="md-button md-button-outlined w-full min-h-[44px] touch-target focus-visible:outline-2 focus-visible:outline-offset-2" 
                style="border-color: #84CC16; color: #84CC16; background-color: transparent;"
                aria-label="Browse available courts"
              >
                <span class="md-label-large font-medium">Browse Courts</span>
              </button>
            </div>
          </article>

          <!-- My Sessions Card -->
          <article 
            class="md-card group cursor-pointer transition-all duration-200 hover:shadow-md-elevation-2 focus-within:shadow-md-elevation-2 md:col-span-2 lg:col-span-1" 
            @click="viewSessions" 
            @keydown.enter="viewSessions" 
            @keydown.space="viewSessions" 
            tabindex="0" 
            role="button" 
            aria-label="View your game sessions"
            style="background-color: #FFFFFF;"
          >
            <div class="p-6">
              <!-- Icon Container -->
              <div class="mb-4">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center" 
                  style="background-color: #64748B;"
                >
                  <svg class="w-6 h-6" style="color: #FFFFFF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <!-- Content -->
              <h2 class="md-title-large mb-2" style="color: #334155;">
                My Sessions
              </h2>
              <p class="md-body-large mb-6" style="color: #64748B; line-height: 1.5;">
                View your upcoming and past games
              </p>
              
              <!-- Action Button -->
              <button 
                class="md-button md-button-text w-full min-h-[44px] touch-target focus-visible:outline-2 focus-visible:outline-offset-2" 
                style="color: #334155; background-color: transparent;"
                aria-label="View your game sessions"
              >
                <span class="md-label-large font-medium">View Sessions</span>
              </button>
            </div>
          </article>
        </div>

        <!-- Quick Stats Section -->
        <section class="mt-8" aria-labelledby="stats-heading">
          <h2 id="stats-heading" class="md-title-large mb-4" style="color: #334155;">
            Quick Stats
          </h2>
          
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div 
              class="p-4 text-center rounded-xl" 
              style="background-color: #FFFFFF; box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);"
            >
              <div class="md-headline-large mb-1" style="color: #FDE047; font-weight: 500;">
                0
              </div>
              <div class="md-body-large" style="color: #64748B;">
                Games Played
              </div>
            </div>
            
            <div 
              class="p-4 text-center rounded-xl" 
              style="background-color: #FFFFFF; box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);"
            >
              <div class="md-headline-large mb-1" style="color: #84CC16; font-weight: 500;">
                0
              </div>
              <div class="md-body-large" style="color: #64748B;">
                Partners Found
              </div>
            </div>
            
            <div 
              class="p-4 text-center rounded-xl" 
              style="background-color: #FFFFFF; box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);"
            >
              <div class="md-headline-large mb-1" style="color: #334155; font-weight: 500;">
                0
              </div>
              <div class="md-body-large" style="color: #64748B;">
                Courts Booked
              </div>
            </div>
            
            <div 
              class="p-4 text-center rounded-xl col-span-2 lg:col-span-1" 
              style="background-color: #FFFFFF; box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);"
            >
              <div class="md-headline-large mb-1" style="color: #84CC16; font-weight: 500;">
                0%
              </div>
              <div class="md-body-large" style="color: #64748B;">
                Attendance Rate
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Player dashboard functionality with preserved behavior
const startMatching = () => {
  // TODO: Navigate to player matching interface
  console.log('Starting player matching...')
}

const browseCourts = () => {
  // TODO: Navigate to court browsing interface
  console.log('Browsing courts...')
}

const viewSessions = () => {
  // TODO: Navigate to sessions view
  console.log('Viewing sessions...')
}
</script>
