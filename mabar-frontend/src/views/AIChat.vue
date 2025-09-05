<template>
  <div class="min-h-screen" style="background-color: var(--md-sys-color-background);">
    <!-- Header -->
    <header class="p-xl pb-lg border-b" style="border-color: var(--md-sys-color-outline-variant);">
      <div class="flex items-center gap-lg">
        <button @click="$router.back()" class="md-button md-button-text p-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="md-headline-large" style="color: var(--md-sys-color-on-background);">
            AI Matchmaking
          </h1>
          <p class="md-body-large" style="color: var(--md-sys-color-on-surface-variant);">
            Find players and courts with AI assistance
          </p>
        </div>
      </div>
    </header>

    <!-- Chat Container -->
    <main class="flex flex-col h-[calc(100vh-120px)]">
      <!-- Messages Area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-xl space-y-lg">
        <div v-for="message in messages" :key="message.id" class="flex" :class="message.isUser ? 'justify-end' : 'justify-start'">
          
          <!-- AI Message -->
          <div v-if="!message.isUser" class="flex gap-md max-w-[80%]">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--md-sys-color-primary);">
              <svg class="w-5 h-5" style="color: var(--md-sys-color-on-primary);" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="md-card p-lg" style="background-color: var(--md-sys-color-surface);">
              <p class="md-body-large" style="color: var(--md-sys-color-on-surface);" v-html="message.text"></p>
            </div>
          </div>

          <!-- User Message -->
          <div v-else class="flex gap-md max-w-[80%]">
            <div class="md-card p-lg" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">
              <p class="md-body-large">{{ message.text }}</p>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--md-sys-color-secondary);">
              <svg class="w-5 h-5" style="color: var(--md-sys-color-on-secondary);" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="flex gap-md max-w-[80%]">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: var(--md-sys-color-primary);">
              <div class="loading-spinner"></div>
            </div>
            <div class="md-card p-lg" style="background-color: var(--md-sys-color-surface);">
              <p class="md-body-large" style="color: var(--md-sys-color-on-surface-variant);">AI is thinking...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-xl border-t" style="border-color: var(--md-sys-color-outline-variant); background-color: var(--md-sys-color-surface);">
        <div class="flex gap-md items-end">
          <div class="flex-1">
            <textarea
              v-model="currentMessage"
              @keydown.enter.prevent="handleEnter"
              placeholder="Ask me to find players or courts... (e.g., 'Find me a partner for tomorrow evening')"
              class="w-full p-lg border rounded-lg resize-none"
              style="background-color: var(--md-sys-color-surface-variant); border-color: var(--md-sys-color-outline); color: var(--md-sys-color-on-surface);"
              rows="2"
              :disabled="isLoading"
            ></textarea>
          </div>
          <button
            @click="sendMessage"
            :disabled="!currentMessage.trim() || isLoading"
            class="md-button md-button-filled touch-target-large"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-sm mt-md">
          <button
            v-for="suggestion in quickSuggestions"
            :key="suggestion"
            @click="sendQuickMessage(suggestion)"
            class="md-button md-button-outlined text-sm"
            :disabled="isLoading"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
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

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''
  
  addMessage(userMessage, true)
  isLoading.value = true

  try {
    // TODO: Replace with actual Gemini API call via Back4App Cloud Function
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
    
    // Mock AI response based on user input
    let aiResponse = generateMockResponse(userMessage)
    
    addMessage(aiResponse, false)
  } catch (error) {
    addMessage('Sorry, I encountered an error. Please try again.', false)
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

const generateMockResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  if (message.includes('partner') || message.includes('player')) {
    return `I found several players who match your preferences:<br><br>
    <strong>🏆 Ahmad Rizki</strong> - Intermediate level<br>
    Available: Tonight 7-9 PM<br>
    Preferred area: Jakarta Selatan<br><br>
    
    <strong>🎾 Sari Dewi</strong> - Beginner level<br>
    Available: Tonight 8-10 PM<br>
    Preferred area: Jakarta Pusat<br><br>
    
    Would you like me to help you contact any of these players?`
  }
  
  if (message.includes('court') || message.includes('book')) {
    return `Here are available courts for your request:<br><br>
    <strong>🏟️ Jakarta Padel Center</strong><br>
    Court 2: Tomorrow 7:00-8:30 PM - Rp 175,000<br>
    Court 4: Tomorrow 8:30-10:00 PM - Rp 175,000<br><br>
    
    <strong>🏟️ Elite Padel Club</strong><br>
    Court 1: Tomorrow 6:00-7:30 PM - Rp 200,000<br><br>
    
    Would you like me to help you book any of these courts?`
  }
  
  if (message.includes('weekend') || message.includes('saturday') || message.includes('sunday')) {
    return `Great! Here are weekend options:<br><br>
    <strong>Saturday Options:</strong><br>
    • 3 players available for morning sessions<br>
    • Jakarta Padel Center has 2 courts free<br>
    • Weekend rate: Rp 225,000/session<br><br>
    
    <strong>Sunday Options:</strong><br>
    • 5 players available for afternoon<br>
    • Multiple venues available<br><br>
    
    What time works best for you?`
  }
  
  return `I understand you're looking for padel options! Based on our current data:<br><br>
  • <strong>8 approved venues</strong> in Jakarta area<br>
  • <strong>31 active players</strong> ready to play<br>
  • <strong>30+ sessions</strong> happening this week<br><br>
  
  Could you be more specific about what you're looking for? For example:<br>
  • "Find me a partner for tomorrow evening"<br>
  • "Show me courts available this weekend"<br>
  • "I want to play with intermediate players"`
}

onMounted(() => {
  addMessage('Hi! I\'m your AI padel assistant. I can help you find players, book courts, and organize games. What would you like to do today?', false)
})
</script>