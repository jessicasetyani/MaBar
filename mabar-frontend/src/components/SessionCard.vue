<template>
  <div class="session-card" :class="cardClasses">
    <!-- Existing Session Card -->
    <div v-if="type === 'existing-session'" class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="venue-info">
          <h3 class="venue-name">{{ data.venue }}</h3>
          <p class="session-time">{{ data.time }} • {{ data.date }}</p>
        </div>
        <div class="cost-badge">
          {{ data.cost }}
        </div>
      </div>

      <!-- Players -->
      <div class="players-section">
        <div class="players-header">
          <span class="players-label">Players ({{ data.players.length }}/4)</span>
          <span v-if="data.openSlots" class="open-slots">{{ data.openSlots }} spot{{ data.openSlots > 1 ? 's' : '' }} left</span>
        </div>
        <div class="players-list">
          <div v-for="player in data.players" :key="player.name" class="player-item">
            <div class="player-avatar">{{ player.name.charAt(0) }}</div>
            <div class="player-info">
              <span class="player-name">{{ player.name }}</span>
              <span class="player-level">{{ player.skillLevel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="$emit('join-session', data)"
        class="action-button primary"
        :disabled="!data.openSlots"
      >
        {{ data.openSlots ? 'Join Game' : 'Full' }}
      </button>
    </div>

    <!-- Create New Session Card -->
    <div v-else-if="type === 'create-new'" class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="venue-info">
          <h3 class="venue-name">{{ data.venue }}</h3>
          <p class="session-time">{{ data.suggestedTime }} • {{ data.suggestedDate }}</p>
        </div>
        <div class="cost-badge">
          {{ data.estimatedCost }}
        </div>
      </div>

      <!-- Create Session Info -->
      <div class="create-info">
        <div class="create-icon">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
        <div class="create-text">
          <p class="create-title">Create New Session</p>
          <p class="create-subtitle">Be the first player and invite others</p>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="$emit('create-session', data)"
        class="action-button secondary"
      >
        Create New Session
      </button>
    </div>

    <!-- No Availability Card -->
    <div v-else-if="type === 'no-availability'" class="card-content">
      <div class="no-availability">
        <div class="no-availability-icon">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="no-availability-text">
          <p class="no-availability-title">{{ data.message || 'No sessions found' }}</p>
          <p class="no-availability-subtitle">Would you like to create a new session instead?</p>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="$emit('create-session', data)"
        class="action-button secondary"
      >
        Create New Session
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Player {
  name: string
  skillLevel: string
}

interface SessionData {
  // Existing session
  venue?: string
  time?: string
  date?: string
  cost?: string
  players?: Player[]
  openSlots?: number
  
  // Create new session
  suggestedTime?: string
  suggestedDate?: string
  estimatedCost?: string
  
  // No availability
  message?: string
}

interface Props {
  type: 'existing-session' | 'create-new' | 'no-availability'
  data: SessionData
}

const props = defineProps<Props>()

defineEmits<{
  'join-session': [data: SessionData]
  'create-session': [data: SessionData]
}>()

const cardClasses = computed(() => ({
  'existing-session': props.type === 'existing-session',
  'create-new': props.type === 'create-new',
  'no-availability': props.type === 'no-availability'
}))
</script>

<script lang="ts">
import { computed } from 'vue'
export default {
  name: 'SessionCard'
}
</script>

<style scoped>
.session-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 20px;
  margin: 12px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.session-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.venue-info {
  flex: 1;
}

.venue-name {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.session-time {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.cost-badge {
  background-color: #FDE047;
  color: #334155;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

/* Players Section */
.players-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.players-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.open-slots {
  font-size: 12px;
  color: #84CC16;
  font-weight: 500;
}

.players-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FEFCE8;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.player-avatar {
  width: 32px;
  height: 32px;
  background-color: #84CC16;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.player-level {
  font-size: 12px;
  color: #64748B;
}

/* Create Session */
.create-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #FEFCE8;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.create-icon {
  width: 48px;
  height: 48px;
  background-color: #FDE047;
  color: #334155;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.create-text {
  flex: 1;
}

.create-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 4px 0;
}

.create-subtitle {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

/* No Availability */
.no-availability {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  text-align: left;
}

.no-availability-icon {
  width: 48px;
  height: 48px;
  background-color: #64748B;
  color: #FFFFFF;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.no-availability-text {
  flex: 1;
}

.no-availability-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 4px 0;
}

.no-availability-subtitle {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

/* Action Buttons */
.action-button {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.primary {
  background-color: #FDE047;
  color: #334155;
}

.action-button.primary:hover:not(:disabled) {
  background-color: #FACC15;
  transform: translateY(-1px);
}

.action-button.primary:disabled {
  background-color: #E5E7EB;
  color: #64748B;
  cursor: not-allowed;
}

.action-button.secondary {
  background-color: #84CC16;
  color: #FFFFFF;
}

.action-button.secondary:hover {
  background-color: #65A30D;
  transform: translateY(-1px);
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(253, 224, 71, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .session-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .cost-badge {
    align-self: flex-start;
  }
  
  .players-list {
    flex-direction: column;
  }
  
  .player-item {
    justify-content: flex-start;
  }
}
</style>