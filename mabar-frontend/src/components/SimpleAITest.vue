<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-[#334155]">Simple AI Test Flow</h2>
    
    <!-- Input Section -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-[#334155] mb-2">
        User Input:
      </label>
      <input
        v-model="userInput"
        type="text"
        placeholder="e.g., 'I want to play padel at 8pm in Senayan'"
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
        @keyup.enter="runTest"
      />
      <button
        @click="runTest"
        :disabled="loading || !userInput.trim()"
        class="mt-3 px-6 py-2 bg-[#FDE047] text-[#334155] font-medium rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Processing...' : 'Test AI Flow' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="results.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold text-[#334155]">Test Results:</h3>
      
      <div
        v-for="(result, index) in results"
        :key="index"
        class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <div class="flex justify-between items-start mb-3">
          <h4 class="font-medium text-[#334155]">Test #{{ index + 1 }}</h4>
          <span class="text-xs text-[#64748B]">{{ result.timestamp }}</span>
        </div>
        
        <!-- User Input -->
        <div class="mb-3">
          <span class="text-sm font-medium text-[#64748B]">Input:</span>
          <p class="text-sm text-[#334155] bg-gray-50 p-2 rounded mt-1">{{ result.input }}</p>
        </div>
        
        <!-- AI Selection -->
        <div class="mb-3">
          <span class="text-sm font-medium text-[#64748B]">AI Selected Action:</span>
          <div class="text-sm text-[#334155] bg-blue-50 p-2 rounded mt-1">
            <strong>{{ result.aiRequest.action }}</strong>
            <pre class="text-xs mt-1 text-gray-600">{{ JSON.stringify(result.aiRequest.parameters, null, 2) }}</pre>
          </div>
        </div>
        
        <!-- Toolbox Result -->
        <div class="mb-3">
          <span class="text-sm font-medium text-[#64748B]">Toolbox Result:</span>
          <pre class="text-xs text-[#334155] bg-green-50 p-2 rounded mt-1 overflow-x-auto">{{ JSON.stringify(result.toolboxResult, null, 2) }}</pre>
        </div>
        
        <!-- Final Response -->
        <div>
          <span class="text-sm font-medium text-[#64748B]">Final Response:</span>
          <p class="text-sm text-[#334155] bg-yellow-50 p-2 rounded mt-1">{{ result.finalResponse.text }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Test Buttons -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold text-[#334155] mb-3">Quick Tests:</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <button
          v-for="testCase in quickTests"
          :key="testCase.label"
          @click="runQuickTest(testCase.input)"
          :disabled="loading"
          class="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border text-left disabled:opacity-50"
        >
          <strong>{{ testCase.label }}:</strong><br>
          <span class="text-gray-600">{{ testCase.input }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SimpleAITestFlow, type SimpleAIRequest } from '../services/simpleAITestFlow'

const userInput = ref('')
const loading = ref(false)
const results = ref<Array<{
  input: string
  aiRequest: SimpleAIRequest
  toolboxResult: any
  finalResponse: any
  timestamp: string
}>>([])

const quickTests = [
  { label: 'Find Match', input: 'I want to play padel at 8pm in Senayan' },
  { label: 'Show Venues', input: 'Show me available courts tomorrow' },
  { label: 'Join Game', input: 'Find open games I can join' },
  { label: 'Create Game', input: 'Start a new padel game for tonight' },
  { label: 'Need Info', input: 'Hi there' },
  { label: 'Complex Query', input: 'Looking for intermediate level padel partners in South Jakarta this weekend' }
]

async function runTest() {
  if (!userInput.value.trim() || loading.value) return
  
  loading.value = true
  const input = userInput.value.trim()
  
  try {
    console.log('\n🧪 Running AI Test Flow for:', input)
    
    // Step 1: Get AI analysis
    const aiRequest = await SimpleAITestFlow.processUserInput(input)
    
    // Step 2: Execute toolbox
    const toolboxResult = await SimpleAITestFlow.executeToolbox(aiRequest)
    
    // Step 3: Generate response
    const finalResponse = await SimpleAITestFlow.generateResponse(toolboxResult, aiRequest.action)
    
    // Store result
    results.value.unshift({
      input,
      aiRequest,
      toolboxResult,
      finalResponse,
      timestamp: new Date().toLocaleTimeString()
    })
    
    // Clear input
    userInput.value = ''
    
  } catch (error) {
    console.error('Test failed:', error)
    alert('Test failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

async function runQuickTest(input: string) {
  userInput.value = input
  await runTest()
}
</script>