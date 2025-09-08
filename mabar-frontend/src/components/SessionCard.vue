<template>
  <div class="session-card" :class="sessionStatusClass">
    <!-- Session Header -->
    <div class="session-header">
      <div class="session-main-info">
        <div class="session-title-row">
          <h3 class="venue-name">{{ data.venue }}</h3>
          <div class="session-status-badge" :class="sessionStatusBadgeClass">
            {{ sessionStatusText }}
          </div>
        </div>
        <p class="session-details">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
          {{ sessionTimeText }}
        </p>
        <p v-if="data.address" class="session-location">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          {{ data.address }}
        </p>
      </div>
      <div class="session-actions">
        <div class="price-display">{{ priceText }}</div>
        <button v-if="data.address" @click="openDirections" class="directions-button">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          Directions
        </button>
      </div>
    </div>

    <!-- Session Content -->
    <div class="session-content">
      <!-- Available Courts Info -->
      <div v-if="data.totalCourts && data.totalCourts > 1" class="courts-info">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clip-rule="evenodd" />
        </svg>
        {{ data.totalCourts }} courts available
      </div>
      
      <!-- Players Section -->
      <div v-if="hasPlayers" class="players-section">
        <div class="players-header">
          <span class="players-title">Current Players</span>
          <span class="availability-status" :class="availabilityStatusClass">
            {{ availabilityStatusText }}
          </span>
        </div>
        <div class="players-grid">
          <div v-for="player in data.players" :key="player.name" class="player-card">
            <div class="player-avatar">{{ player.name.charAt(0) }}</div>
            <div class="player-info">
              <span class="player-name">{{ player.name }}</span>
              <span class="player-skill">{{ player.skillLevel }}</span>
            </div>
          </div>
          <!-- Empty slots -->
          <div v-for="n in (data.openSlots || 0)" :key="`empty-${n}`" class="empty-slot">
            <div class="empty-avatar">+</div>
            <span class="empty-text">Open spot</span>
          </div>
        </div>
      </div>
      
      <!-- Action Button -->
      <button 
        @click="handleSessionAction()"
        class="session-action-button"
        :class="actionButtonClass"
      >
        {{ actionButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Player {
  name: string
  skillLevel: string
}

interface Court {
  name?: string
  time?: string
  date?: string
  cost?: string
  players?: Player[]
  openSlots?: number
  available?: boolean
}

interface SessionData {
  // Venue information
  venue?: string
  address?: string
  area?: string
  
  // Single session/court
  time?: string
  date?: string
  cost?: string
  players?: Player[]
  openSlots?: number
  totalCourts?: number
  
  // Session status
  status?: 'available' | 'joining' | 'full' | 'pending'
  
  // Multiple courts
  courts?: Court[]
  
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

const emit = defineEmits<{
  'join-session': [data: SessionData]
  'create-session': [data: SessionData]
}>()

// Computed properties for better UX
const hasPlayers = computed(() => props.data.players && props.data.players.length > 0)
const isFull = computed(() => hasPlayers.value && (!props.data.openSlots || props.data.openSlots === 0))
const canJoin = computed(() => hasPlayers.value && props.data.openSlots && props.data.openSlots > 0)

const sessionStatusClass = computed(() => ({
  'has-players': hasPlayers.value,
  'is-full': isFull.value,
  'can-join': canJoin.value
}))

const sessionStatusBadgeClass = computed(() => ({
  'status-available': !hasPlayers.value,
  'status-joining': canJoin.value,
  'status-full': isFull.value
}))

const sessionStatusText = computed(() => {
  if (isFull.value) return 'Full'
  if (canJoin.value) return `${props.data.openSlots} spots open`
  if (props.data.totalCourts && props.data.totalCourts > 1) return `${props.data.totalCourts} courts available`
  return 'Available'
})

const sessionTimeText = computed(() => {
  const time = props.data.time || props.data.suggestedTime
  const date = props.data.date || props.data.suggestedDate
  
  // Show clear weekend options with actual dates
  if (time?.includes('Anytime') || time?.includes('All day')) {
    const today = new Date()
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + (6 - today.getDay()))
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    
    const satDate = saturday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const sunDate = sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    
    return `All day • ${satDate} or ${sunDate}`
  }
  
  return `${time} • ${date}`
})

const priceText = computed(() => {
  const price = props.data.cost || props.data.estimatedCost
  return price
})

const availabilityStatusClass = computed(() => ({
  'status-open': canJoin.value,
  'status-full': isFull.value
}))

const availabilityStatusText = computed(() => {
  if (isFull.value) return 'Session Full'
  return `${props.data.openSlots} spots available`
})

const actionButtonClass = computed(() => ({
  'action-join': canJoin.value,
  'action-create': !hasPlayers.value,
  'action-full': isFull.value
}))

const actionButtonText = computed(() => {
  if (isFull.value) return 'Session Full'
  if (canJoin.value) return `Join Session (${props.data.openSlots} spots left)`
  return 'Create New Session'
})

const openDirections = () => {
  if (props.data.address) {
    const encodedAddress = encodeURIComponent(`${props.data.venue}, ${props.data.address}`)
    const mapsUrl = `https://maps.google.com/maps?q=${encodedAddress}`
    window.open(mapsUrl, '_blank')
  }
}

const handleSessionAction = () => {
  if (isFull.value) return
  
  if (canJoin.value) {
    emit('join-session', props.data)
  } else {
    emit('create-session', props.data)
  }
}
</script>

<script lang="ts">
export default {
  name: 'SessionCard'
}
</script>

<style scoped>
/* Session Card */
.session-card {
  background-color: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  margin: 16px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
}

.session-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.session-card.can-join {
  border-color: #84CC16;
  background-color: #FEFCE8;
}

.session-card.is-full {
  border-color: #64748B;
  background-color: #F8FAFC;
  opacity: 0.8;
}

/* Session Header */
.session-header {
  padding: 20px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.session-main-info {
  flex: 1;
}

.session-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.venue-name {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  line-height: 1.3;
}

.session-status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-status-badge.status-available {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.session-status-badge.status-joining {
  background-color: #DCFCE7;
  color: #166534;
}

.session-status-badge.status-full {
  background-color: #F1F5F9;
  color: #64748B;
}

.session-details,
.session-location {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.session-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.price-display {
  background-color: #FDE047;
  color: #334155;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.directions-button {
  background-color: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.directions-button:hover {
  background-color: #F8FAFC;
  color: #334155;
}

/* Session Content */
.session-content {
  padding: 20px;
}

.courts-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748B;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: #F8FAFC;
  border-radius: 8px;
}

/* Courts List */
.courts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.court-item {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  background-color: #FEFCE8;
}

.single-court {
  /* No additional styling needed, inherits from courts-section */
}

/* Court Header */
.court-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.court-info {
  flex: 1;
}

.court-name {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  display: block;
  margin-bottom: 4px;
}

.court-time {
  font-size: 14px;
  color: #64748B;
  display: block;
}

.court-price {
  background-color: #FDE047;
  color: #334155;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* Players Section */
.players-section {
  margin-bottom: 20px;
}

.players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.players-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.availability-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
}

.availability-status.status-open {
  background-color: #DCFCE7;
  color: #166534;
}

.availability-status.status-full {
  background-color: #F1F5F9;
  color: #64748B;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: #FEFCE8;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
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
  flex: 1;
}

.player-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  display: block;
}

.player-skill {
  font-size: 12px;
  color: #64748B;
}

.empty-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: #F8FAFC;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
}

.empty-avatar {
  width: 32px;
  height: 32px;
  background-color: #E5E7EB;
  color: #64748B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.empty-text {
  font-size: 12px;
  color: #64748B;
  font-style: italic;
}

/* Session Action Button */
.session-action-button {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 52px;
}

.session-action-button.action-join {
  background-color: #84CC16;
  color: #FFFFFF;
}

.session-action-button.action-join:hover {
  background-color: #65A30D;
  transform: translateY(-1px);
}

.session-action-button.action-create {
  background-color: #FDE047;
  color: #334155;
}

.session-action-button.action-create:hover {
  background-color: #FACC15;
  transform: translateY(-1px);
}

.session-action-button.action-full {
  background-color: #E5E7EB;
  color: #64748B;
  cursor: not-allowed;
}

.session-action-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .venue-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .courts-section {
    padding: 16px;
  }
  
  .court-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .court-price {
    align-self: flex-start;
  }
  
  .directions-button {
    align-self: flex-start;
  }
}
</style>