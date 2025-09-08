<template>
  <div class="venue-group">
    <!-- Venue Group Header -->
    <div class="venue-group-header">
      <h4 class="venue-group-title">
        <svg class="venue-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clip-rule="evenodd" />
        </svg>
        {{ venueName }}
      </h4>
      <p v-if="location" class="venue-group-location">
        <svg class="location-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        {{ location }}
      </p>
      <p v-if="sessionCount > 1" class="session-count">{{ sessionCount }} available sessions</p>
    </div>
    
    <!-- Session Cards -->
    <div class="venue-sessions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  venueName: string
  location?: string
  sessionCount: number
}

defineProps<Props>()
</script>

<style scoped>
.venue-group {
  margin: 16px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.venue-group-header {
  background-color: #FEFCE8;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.venue-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.venue-icon {
  width: 20px;
  height: 20px;
  color: #FDE047;
}

.venue-group-location {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-icon {
  width: 16px;
  height: 16px;
}

.session-count {
  font-size: 13px;
  color: #84CC16;
  margin: 0;
  font-weight: 500;
}

.venue-sessions {
  background-color: #FFFFFF;
}

.venue-sessions :deep(.session-card) {
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  margin: 0;
}

.venue-sessions :deep(.session-card:last-child) {
  border-bottom: none;
}
</style>