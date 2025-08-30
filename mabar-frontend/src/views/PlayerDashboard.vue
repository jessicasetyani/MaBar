<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-text mb-6">Player Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Find Players</h2>
        <p class="text-subtle mb-4">
          Connect with other players for your next game
        </p>
        <button
          class="bg-primary text-text px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-colors"
        >
          Start Matching
        </button>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Book Courts</h2>
        <p class="text-subtle mb-4">Find and book available courts near you</p>
        <button
          class="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          Browse Courts
        </button>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">My Sessions</h2>
        <p class="text-subtle mb-4">View your upcoming and past games</p>
        <button
          class="bg-text text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          View Sessions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Player dashboard functionality will be implemented in future tasks
</script>
