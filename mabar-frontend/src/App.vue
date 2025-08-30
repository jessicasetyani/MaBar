<script setup lang="ts">
// Test component for Tailwind CSS custom colors
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-text mb-8">MaBar - Tailwind CSS Test</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Primary Color Test -->
        <div class="bg-surface p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-text mb-4">Primary Color</h2>
          <button class="bg-primary text-text px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Book Now
          </button>
          <p class="text-subtle mt-2 text-sm">#FDE047 - MaBar Yellow</p>
        </div>

        <!-- Accent Color Test -->
        <div class="bg-surface p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-text mb-4">Accent Color</h2>
          <button class="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Success Action
          </button>
          <p class="text-subtle mt-2 text-sm">#84CC16 - Padel Green</p>
        </div>

        <!-- Text Colors Test -->
        <div class="bg-surface p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-text mb-4">Text Colors</h2>
          <p class="text-text mb-2">Primary text color</p>
          <p class="text-subtle">Subtle text color</p>
          <p class="text-subtle mt-2 text-sm">Charcoal & Slate Gray</p>
        </div>
      </div>

      <div class="mt-8 bg-surface p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-text mb-4">Color Palette Overview</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-lg mx-auto mb-2"></div>
            <p class="text-sm text-text font-medium">Primary</p>
            <p class="text-xs text-subtle">#FDE047</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-background border-2 border-subtle rounded-lg mx-auto mb-2"></div>
            <p class="text-sm text-text font-medium">Background</p>
            <p class="text-xs text-subtle">#FEFCE8</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-surface border-2 border-subtle rounded-lg mx-auto mb-2"></div>
            <p class="text-sm text-text font-medium">Surface</p>
            <p class="text-xs text-subtle">#FFFFFF</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-text rounded-lg mx-auto mb-2"></div>
            <p class="text-sm text-text font-medium">Text</p>
            <p class="text-xs text-subtle">#334155</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-subtle rounded-lg mx-auto mb-2"></div>
            <p class="text-sm text-text font-medium">Subtle</p>
            <p class="text-xs text-subtle">#64748B</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-accent rounded-lg mx-auto mb-2"></div>
            <p class="text-sm text-text font-medium">Accent</p>
            <p class="text-xs text-subtle">#84CC16</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
