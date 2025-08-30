<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div
      class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <!-- Header -->
      <div class="bg-emerald-500 px-8 py-12 text-center">
        <div
          class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">MaBar</h1>
        <p class="text-emerald-100">Badminton Match & Venue Booking</p>
      </div>

      <!-- Simple Content -->
      <div class="p-8 text-center">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Welcome!</h2>
        <p class="text-slate-600 mb-6">
          This is a simplified version to test the app.
        </p>
        <button
          class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl transition-all duration-200 font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  </div>
</template>
