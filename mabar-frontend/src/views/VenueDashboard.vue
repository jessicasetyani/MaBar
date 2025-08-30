<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-text mb-6">Venue Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Manage Courts</h2>
        <p class="text-subtle mb-4">Configure your courts and availability</p>
        <button
          class="bg-primary text-text px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-colors"
        >
          Manage Courts
        </button>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Bookings</h2>
        <p class="text-subtle mb-4">View and manage court bookings</p>
        <button
          class="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          View Bookings
        </button>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Analytics</h2>
        <p class="text-subtle mb-4">Track your venue performance</p>
        <button
          class="bg-text text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          View Analytics
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Venue dashboard functionality will be implemented in future tasks
</script>
