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
            @mouseenter="$event.target.style.backgroundColor = '#F8FAFC'"
            @mouseleave="$event.target.style.backgroundColor = 'transparent'"
            @focus="$event.target.style.backgroundColor = '#F8FAFC'; $event.target.style.boxShadow = '0 0 0 2px rgba(253, 224, 71, 0.3)'"
            @blur="$event.target.style.backgroundColor = 'transparent'; $event.target.style.boxShadow = 'none'"
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

    <!-- Chat Container with full height and fixed input -->
    <main class="flex flex-col" style="height: 100vh; position: relative;">
      <!-- Messages Area with proper spacing -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto" style="padding: 24px 16px; padding-bottom: 120px;">
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
                  <SessionCard
                    v-for="(card, index) in message.sessionCards"
                    :key="index"
                    :type="card.type"
                    :data="card.data"
                    @join-session="handleJoinSession"
                    @create-session="handleCreateSession"
                  />
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

      <!-- Input Area fixed at bottom with no gaps -->
      <div class="border-t" style="border-color: #64748B; background-color: #FFFFFF; padding: 16px; position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center" style="gap: 16px;">
            <div class="flex-1">
              <textarea
                v-model="currentMessage"
                @keydown.enter.prevent="handleEnter"
                placeholder="Ask me to find players or courts... (e.g., 'Find me a partner for tomorrow evening')"
                class="w-full rounded-2xl resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style="background-color: #FEFCE8; border: 2px solid #64748B; color: #334155; padding: 16px; focus:border-color: #FDE047; focus:ring-color: #FDE047;"
                rows="2"
                :disabled="isLoading"
              ></textarea>
            </div>
            <!-- Send Icon Button - Borderless Material Design 3 -->
            <IconButton
              @click="sendMessage"
              :disabled="!currentMessage.trim() || isLoading"
              variant="text"
              size="lg"
              ariaLabel="Send message"
              class="flex-shrink-0"
              :class="{ 'opacity-50 cursor-not-allowed': !currentMessage.trim() || isLoading }"
              :icon-svg="`<svg class='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'><path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/></svg>`"
            />
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
              @mouseenter="$event.target.style.backgroundColor = isLoading ? '#FFFFFF' : '#F8FAFC'"
              @mouseleave="$event.target.style.backgroundColor = '#FFFFFF'"
              @focus="$event.target.style.borderColor = '#FDE047'; $event.target.style.boxShadow = '0 0 0 2px rgba(253, 224, 71, 0.3)'"
              @blur="$event.target.style.borderColor = '#E5E7EB'; $event.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'"
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
import { GeminiService, type UserProfile } from '../services/gemini'
import SessionCard from '../components/SessionCard.vue'
import IconButton from '../components/ui/IconButton.vue'

interface SessionData {
  venue?: string
  time?: string
  date?: string
  cost?: string
  players?: Array<{ name: string; skillLevel: string }>
  openSlots?: number
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
}

const messages = ref<Message[]>([])
const currentMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

const quickSuggestions = [
  'Find me a partner for tonight',
  'Show available courts tomorrow',
  'Find intermediate players',
  'Book a court this weekend'
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

const handleCreateSession = (sessionData: SessionData) => {
  const confirmationText = `You're about to create a new session at ${sessionData.venue || sessionData.suggestedTime}. Estimated cost: ${sessionData.estimatedCost}. Confirm?`
  addMessage(confirmationText, false)
  // TODO: Implement session creation logic
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''

  addMessage(userMessage, true)
  isLoading.value = true

  try {
    // Use real Gemini AI integration via Back4App Cloud Function
    const userProfile: UserProfile = {
      skillLevel: 'intermediate', // TODO: Get from user's actual profile
      preferredTime: 'evening',
      location: 'Jakarta',
      playingStyle: 'competitive'
    }

    const response = await GeminiService.getMatchmakingRecommendations(
      userMessage,
      userProfile,
      'en' // TODO: Support user's preferred language
    )

    if (response.success && response.data) {
      // Format the AI recommendations into a readable response
      const aiResponse = formatGeminiResponse(response.data)
      addMessage(aiResponse, false)
    } else {
      // Fallback to mock response if AI service fails
      console.warn('Gemini API failed, using fallback:', response.error)
      const mockResponse = generateMockResponse(userMessage)
      addMessageWithCards(mockResponse.text, mockResponse.sessionCards, false)
    }
  } catch (error) {
    console.error('AI Chat Error:', error)
    // Fallback to mock response on any error
    const fallbackResponse = generateMockResponse(userMessage)
    addMessageWithCards(fallbackResponse.text, fallbackResponse.sessionCards, false)
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



const formatGeminiResponse = (data: any): string => {
  try {
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      return 'I found some options for you, but the response format was unexpected. Please try asking again.'
    }

    let formattedResponse = ''

    // Add reasoning if available
    if (data.reasoning) {
      formattedResponse += `${data.reasoning}<br><br>`
    }

    // Format recommendations
    data.recommendations.forEach((rec: any, index: number) => {
      if (rec.message) {
        formattedResponse += `${rec.message}<br>`
        if (index < data.recommendations.length - 1) {
          formattedResponse += '<br>'
        }
      }
    })

    // Add confidence score if available
    if (data.confidence_score && data.confidence_score > 0.7) {
      formattedResponse += '<br><br><em>High confidence match</em>'
    }

    return formattedResponse || 'I found some options for you! Let me know if you need more specific recommendations.'
  } catch (error) {
    console.error('Error formatting Gemini response:', error)
    return 'I found some options for you, but had trouble formatting the response. Please try asking again.'
  }
}

/**
 * Fallback response generator for when Gemini AI service is unavailable
 * This function provides basic pattern-matching responses to ensure the chat
 * interface remains functional even when the AI service fails or is down.
 * Used as a reliability fallback in the sendMessage() function.
 */
const generateMockResponse = (userMessage: string) => {
  const message = userMessage.toLowerCase()
  
  if (message.includes('partner') || message.includes('player')) {
    return {
      text: 'I found several players who match your preferences:',
      sessionCards: [
        {
          type: 'existing-session' as const,
          data: {
            venue: 'Jakarta Padel Center',
            time: '7:00 PM',
            date: 'Tonight',
            cost: 'Rp 175K each',
            players: [
              { name: 'Ahmad Rizki', skillLevel: 'Intermediate' },
              { name: 'Sari Dewi', skillLevel: 'Intermediate' },
              { name: 'Budi Santoso', skillLevel: 'Advanced' }
            ],
            openSlots: 1
          }
        },
        {
          type: 'create-new' as const,
          data: {
            venue: 'Elite Padel Club',
            suggestedTime: '8:00 PM',
            suggestedDate: 'Tonight',
            estimatedCost: 'Rp 200K each'
          }
        }
      ]
    }
  }
  
  if (message.includes('court') || message.includes('book')) {
    return {
      text: 'Here are available courts for your request:',
      sessionCards: [
        {
          type: 'create-new' as const,
          data: {
            venue: 'Jakarta Padel Center',
            suggestedTime: '7:00 PM',
            suggestedDate: 'Tomorrow',
            estimatedCost: 'Rp 175K each'
          }
        },
        {
          type: 'create-new' as const,
          data: {
            venue: 'Elite Padel Club',
            suggestedTime: '6:00 PM',
            suggestedDate: 'Tomorrow',
            estimatedCost: 'Rp 200K each'
          }
        }
      ]
    }
  }
  
  if (message.includes('weekend') || message.includes('saturday') || message.includes('sunday')) {
    return {
      text: 'Great! Here are weekend options:',
      sessionCards: [
        {
          type: 'existing-session' as const,
          data: {
            venue: 'Jakarta Padel Center',
            time: '9:00 AM',
            date: 'Saturday',
            cost: 'Rp 225K each',
            players: [
              { name: 'Maya Sari', skillLevel: 'Intermediate' },
              { name: 'Andi Wijaya', skillLevel: 'Beginner' }
            ],
            openSlots: 2
          }
        }
      ]
    }
  }
  
  return {
    text: `I understand you're looking for padel options! Based on our current data:<br><br>
    • <strong>8 approved venues</strong> in Jakarta area<br>
    • <strong>31 active players</strong> ready to play<br>
    • <strong>30+ sessions</strong> happening this week<br><br>
    
    Could you be more specific about what you're looking for?`,
    sessionCards: [
      {
        type: 'no-availability' as const,
        data: {
          message: 'Need help finding the right match?'
        }
      }
    ]
  }
}

onMounted(() => {
  addMessage('Hi! I\'m your AI padel assistant. I can help you find players, book courts, and organize games. What would you like to do today?', false)
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

/* Prevent gaps during scrolling */
main {
  overflow: hidden;
}

/* Ensure input area stays fixed at bottom */
.border-t.flex-shrink-0 {
  margin-top: auto;
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