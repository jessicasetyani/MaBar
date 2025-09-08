<template>
  <div class="min-h-screen" style="background-color: #FEFCE8;">
    <!-- Header with proper spacing and back navigation -->
    <header class="border-b" style="border-color: #64748B; background-color: #FFFFFF;">
      <div class="max-w-7xl mx-auto px-4 py-4 md:px-6 lg:px-8">
        <div class="flex items-center" style="gap: 16px;">
          <!-- Back Navigation Button - Material Design 3 compliant -->
          <button
            @click="$router.push('/dashboard')"
            class="flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style="
              min-width: 44px;
              min-height: 44px;
              width: 44px;
              height: 44px;
              background-color: transparent;
              color: #334155;
              border: none;
              border-radius: 12px;
            "
            @mouseenter="handleBackButtonHover"
            @mouseleave="handleBackButtonLeave"
            @focus="handleBackButtonFocus"
            @blur="handleBackButtonBlur"
            aria-label="Go back to dashboard"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <!-- Header content with proper spacing -->
          <div class="flex-1">
            <h1 class="md-headline-large font-medium" style="color: #334155; margin: 0;">
              AI Matchmaking
            </h1>
            <p class="md-body-large" style="color: #64748B; margin: 4px 0 0 0;">
              Find players and courts with AI assistance
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Chat Container with proper height calculation -->
    <main class="flex flex-col" style="height: calc(100vh - 120px); position: relative;">
      <!-- Messages Area with proper spacing -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto" style="padding: 24px 16px; padding-bottom: 24px;">
        <div class="max-w-4xl mx-auto" style="display: flex; flex-direction: column; gap: 24px;">
          <div v-for="message in messages" :key="message.id" class="flex" :class="message.isUser ? 'justify-end' : 'justify-start'">

            <!-- AI Message with improved rounded styling -->
            <div v-if="!message.isUser" class="flex max-w-[85%] md:max-w-[75%]" style="gap: 16px;">
              <!-- AI Avatar -->
              <div class="rounded-full flex items-center justify-center flex-shrink-0" style="width: 40px; height: 40px; background-color: #FDE047; margin-top: 4px;">
                <svg class="w-5 h-5" style="color: #334155;" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <!-- AI Message Bubble with enhanced rounded styling -->
              <div
                class="shadow-sm"
                style="
                  background-color: #FFFFFF;
                  padding: 16px;
                  border: 1px solid #E5E7EB;
                  border-radius: 20px 20px 20px 6px;
                  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                "
              >
                <p v-if="message.text" class="md-body-large leading-relaxed" style="color: #334155; line-height: 1.6; margin: 0;" v-html="message.text"></p>
                
                <!-- Session Cards -->
                <div v-if="message.sessionCards" class="session-cards-container" style="margin-top: 12px;">
                  <template v-for="(card, index) in message.sessionCards" :key="index">
                    <SessionCard
                      v-if="card.type !== 'no-availability'"
                      :type="card.type"
                      :data="card.data"
                      @join-session="handleJoinSession"
                      @create-session="handleCreateSession"
                    />
                    <NoMatchCard
                      v-else
                      :message="card.data.message"
                      @create-session="() => handleCreateSession(card.data)"
                      @modify-search="handleModifySearch"
                      @show-popular="handleShowPopular"
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- User Message with enhanced rounded styling -->
            <div v-else class="flex max-w-[85%] md:max-w-[75%]" style="gap: 16px;">
              <!-- User Message Bubble with enhanced rounded styling -->
              <div
                class="shadow-sm"
                style="
                  background-color: #FDE047;
                  padding: 16px;
                  border-radius: 20px 20px 6px 20px;
                  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                "
              >
                <p class="md-body-large leading-relaxed" style="color: #334155; line-height: 1.6; margin: 0;">{{ message.text }}</p>
              </div>
              <!-- User Avatar -->
              <div class="rounded-full flex items-center justify-center flex-shrink-0" style="width: 40px; height: 40px; background-color: #84CC16; margin-top: 4px;">
                <svg class="w-5 h-5" style="color: #FFFFFF;" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Loading indicator with consistent styling -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="flex max-w-[85%] md:max-w-[75%]" style="gap: 16px;">
              <!-- AI Avatar with Loading -->
              <div class="rounded-full flex items-center justify-center flex-shrink-0" style="width: 40px; height: 40px; background-color: #FDE047; margin-top: 4px;">
                <div class="loading-spinner w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style="border-color: #334155;"></div>
              </div>
              <!-- Loading Message Bubble with enhanced rounded styling -->
              <div
                class="shadow-sm"
                style="
                  background-color: #FFFFFF;
                  padding: 16px;
                  border: 1px solid #E5E7EB;
                  border-radius: 20px 20px 20px 6px;
                  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                "
              >
                <p class="md-body-large leading-relaxed" style="color: #64748B; line-height: 1.6; margin: 0;">AI is thinking...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area fixed at bottom with proper spacing -->
      <div class="border-t" style="border-color: #64748B; background-color: #FFFFFF; padding: 16px; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center" style="gap: 16px;">
            <div class="flex-1">
              <textarea
                v-model="currentMessage"
                @keydown.enter.prevent="handleEnter"
                :placeholder="currentPlaceholder"
                class="w-full rounded-2xl resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style="background-color: #FEFCE8; border: 2px solid #64748B; color: #334155; padding: 16px;"
                rows="2"
                :disabled="isLoading"
              ></textarea>
            </div>
            <!-- Modern Minimalist Send Icon - Transparent Background -->
            <button
              @click="sendMessage"
              :disabled="!currentMessage.trim() || isLoading"
              class="send-icon-button flex items-center justify-center flex-shrink-0 transition-all duration-200"
              :class="{ 'opacity-30 cursor-not-allowed': !currentMessage.trim() || isLoading }"
              aria-label="Send message"
              type="button"
            >
              <!-- Paper Plane Send Icon -->
              <svg
                class="w-6 h-6 transition-all duration-200"
                fill="currentColor"
                viewBox="0 0 24 24"
                :class="{ 'send-icon-disabled': !currentMessage.trim() || isLoading, 'send-icon-enabled': currentMessage.trim() && !isLoading }"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          <!-- Quick Actions with Material Design 3 styling and 8dp spacing -->
          <div class="flex flex-wrap" style="gap: 8px; margin-top: 8px;">
            <button
              v-for="suggestion in quickSuggestions"
              :key="suggestion"
              @click="sendQuickMessage(suggestion)"
              class="text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
              style="
                padding: 12px 24px;
                background-color: #FFFFFF;
                color: #334155;
                border: 1px solid #E5E7EB;
                border-radius: 12px;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
              "
              :class="{
                'opacity-50 cursor-not-allowed': isLoading,
                'hover:bg-gray-50 hover:border-gray-300': !isLoading
              }"
              :disabled="isLoading"
              @mouseenter="(event) => handleSuggestionHover(event, isLoading)"
              @mouseleave="handleSuggestionLeave"
              @focus="handleSuggestionFocus"
              @blur="handleSuggestionBlur"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import SessionCard from '../components/SessionCard.vue'

import NoMatchCard from '../components/NoMatchCard.vue'
import { AIMatchmakingService } from '../services/aiMatchmakingService'

interface SessionData {
  sessionId?: string
  venue?: string
  address?: string
  time?: string
  date?: string
  cost?: string
  players?: Array<{ name: string; skillLevel: string }>
  openSlots?: number
  totalCourts?: number
  status?: 'available' | 'joining' | 'full' | 'pending'
  suggestedTime?: string
  suggestedDate?: string
  estimatedCost?: string
  message?: string
}

interface Message {
  id: number
  text?: string
  isUser: boolean
  timestamp: Date
  sessionCards?: Array<{ type: 'existing-session' | 'create-new' | 'no-availability'; data: SessionData }>
  showNoMatch?: boolean
}

const messages = ref<Message[]>([])
const currentMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()
const currentPlaceholder = ref('')

const quickSuggestions = [
  'Show me courts in Senayan',
  'Find players tonight 7 PM',
  'Book court tomorrow morning',
  'I want to play padel'
]

let messageId = 0

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const addMessage = (text: string, isUser: boolean) => {
  messages.value.push({
    id: messageId++,
    text,
    isUser,
    timestamp: new Date()
  })
  scrollToBottom()
}

const addMessageWithCards = (text: string, sessionCards: Array<{ type: 'existing-session' | 'create-new' | 'no-availability'; data: SessionData }>, isUser: boolean) => {
  messages.value.push({
    id: messageId++,
    text,
    sessionCards,
    isUser,
    timestamp: new Date()
  })
  scrollToBottom()
}

const handleJoinSession = (sessionData: SessionData) => {
  const confirmationText = `You're about to join a session at ${sessionData.venue} on ${sessionData.date} at ${sessionData.time}. Cost: ${sessionData.cost}. Confirm?`
  addMessage(confirmationText, false)
  // TODO: Implement actual booking logic
}

const handleCreateSession = (sessionData?: SessionData) => {
  const venue = sessionData?.venue || 'your preferred venue'
  const time = sessionData?.suggestedTime || sessionData?.time || 'your preferred time'
  const cost = sessionData?.estimatedCost || sessionData?.cost || 'Rp 175,000 per hour'
  
  const confirmationText = `Great! I'll help you create a new session at ${venue} for ${time}. Estimated cost: ${cost}. Would you like me to set this up and notify other players?`
  addMessage(confirmationText, false)
  // TODO: Implement session creation logic
}

const handleModifySearch = () => {
  const suggestionText = `Let's try a different approach! You can:<br><br>
  • Try a different time (e.g., "tomorrow evening" instead of "tonight")<br>
  • Expand your location (e.g., "anywhere in Jakarta" instead of specific area)<br>
  • Be flexible with skill level (e.g., "any skill level" instead of "advanced only")<br><br>
  What would you like to adjust?`
  addMessage(suggestionText, false)
}

const handleShowPopular = () => {
  const popularText = `Here are some popular session times and locations in Jakarta:<br><br>
  • <strong>Weekday evenings (6-8 PM)</strong> - Most active time for after-work games<br>
  • <strong>Weekend mornings (9-11 AM)</strong> - Popular for longer sessions<br>
  • <strong>Senayan & Kemang areas</strong> - Highest concentration of courts and players<br><br>
  Would you like me to search for sessions during these popular times?`
  addMessage(popularText, false)
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''

  addMessage(userMessage, true)
  isLoading.value = true

  try {
    console.log('🤖 Processing AI matchmaking request:', userMessage)

    // Use the new AI matchmaking service
    const aiResponse = await AIMatchmakingService.processMatchmakingRequest(userMessage)
    
    console.log('📝 AI matchmaking response:', aiResponse)

    // Add AI text response if provided
    if (aiResponse.text) {
      addMessage(aiResponse.text, false)
    }

    // Add session cards if provided
    if (aiResponse.sessionCards && aiResponse.sessionCards.length > 0) {
      addMessageWithCards('', aiResponse.sessionCards, false)
    }

    console.log('✅ AI matchmaking response processed successfully')

  } catch (error) {
    console.error('❌ Error in AI matchmaking:', error)
    
    // Fallback response
    addMessage('Sorry, I encountered an issue. Please try again with more specific details.', false)
  } finally {
    isLoading.value = false
  }
}



const sendQuickMessage = (suggestion: string) => {
  currentMessage.value = suggestion
  sendMessage()
}

const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    sendMessage()
  }
}

// Event handlers for back button with proper TypeScript typing
const handleBackButtonHover = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.backgroundColor = '#F8FAFC'
  }
}

const handleBackButtonLeave = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.backgroundColor = 'transparent'
  }
}

const handleBackButtonFocus = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.backgroundColor = '#F8FAFC'
    target.style.boxShadow = '0 0 0 2px rgba(253, 224, 71, 0.3)'
  }
}

const handleBackButtonBlur = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.backgroundColor = 'transparent'
    target.style.boxShadow = 'none'
  }
}

// Event handlers for suggestion buttons with proper TypeScript typing
const handleSuggestionHover = (event: Event, isLoading: boolean) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.backgroundColor = isLoading ? '#FFFFFF' : '#F8FAFC'
  }
}

const handleSuggestionLeave = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.backgroundColor = '#FFFFFF'
  }
}

const handleSuggestionFocus = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.borderColor = '#FDE047'
    target.style.boxShadow = '0 0 0 2px rgba(253, 224, 71, 0.3)'
  }
}

const handleSuggestionBlur = (event: Event) => {
  const target = event.target as HTMLElement
  if (target) {
    target.style.borderColor = '#E5E7EB'
    target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  }
}







onMounted(() => {
  // Option 3: Clear and action-focused placeholder
  currentPlaceholder.value = "Ask me to find courts, players, or organize games..."
})
</script>

<style scoped>
/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus styles for better accessibility - Material Design 3 compliant */
textarea:focus {
  border-color: #FDE047 !important;
  box-shadow: 0 0 0 3px rgba(253, 224, 71, 0.2) !important;
}

/* Input area fixed positioning styles */
.border-t {
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

/* Ensure main content doesn't overlap with fixed input */
main {
  margin-bottom: 140px; /* Space for fixed input area */
}

/* Adjust body to prevent scrolling issues */
body {
  overflow-x: hidden;
}

/* Modern Minimalist Send Button Styles */
.send-icon-button {
  /* Completely transparent background */
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;

  /* Maintain 48px touch target for accessibility */
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;

  /* Remove any default button styling */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* Smooth transitions for hover effects */
  transition: all 0.2s ease;
}

/* Hover effects - subtle opacity and scale changes */
.send-icon-button:hover:not(:disabled) {
  transform: scale(1.1);
}

.send-icon-button:hover:not(:disabled) .send-icon-enabled {
  color: #FACC15 !important; /* Slightly darker yellow on hover */
  opacity: 0.9;
}

.send-icon-button:hover:not(:disabled) .send-icon-disabled {
  opacity: 0.5; /* Reduce opacity further on hover for disabled state */
}

/* Active state for better feedback */
.send-icon-button:active:not(:disabled) {
  transform: scale(0.95);
}

/* Focus state for accessibility */
.send-icon-button:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5) !important;
  outline-offset: 2px;
}

/* Disabled state styling */
.send-icon-button:disabled {
  cursor: not-allowed;
  transform: none;
}

.send-icon-button:disabled svg {
  opacity: 0.3;
}

/* MaBar Color Palette for Send Icon */
.send-icon-enabled {
  color: #FDE047 !important; /* MaBar Yellow - Primary Color */
}

.send-icon-disabled {
  color: #64748B !important; /* Slate Gray - Subtle Color for disabled state */
  opacity: 0.7; /* Additional opacity for better disabled indication */
}

button:focus {
  box-shadow: 0 0 0 3px rgba(253, 224, 71, 0.3) !important;
}

/* Hover effects with subtle animation */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}



/* Smooth scrolling for messages */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Prevent gaps during scrolling and ensure proper spacing */
main {
  overflow: hidden;
  padding-bottom: 0;
}

/* Ensure messages container has proper bottom spacing */
.overflow-y-auto {
  padding-bottom: 24px !important;
  margin-bottom: 140px; /* Space for fixed input */
}



/* Ensure proper spacing and layout */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.rounded-full {
  border-radius: 50%;
}

/* Remove any default margins from paragraphs in chat bubbles */
p {
  margin: 0;
}
</style>