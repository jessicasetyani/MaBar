# @mabar/ai-services

A modular AI services package for the MaBar padel matchmaking application. This package provides a clean, service-oriented architecture for integrating multiple AI providers with consistent interfaces and robust error handling.

## Features

- 🤖 **Multi-Provider Support**: Easily switch between different AI providers
- 🏗️ **Service-Oriented Architecture**: Clean separation of concerns with dependency injection
- 🔧 **Configuration Management**: Environment-based configuration with sensible defaults
- 📊 **Performance Monitoring**: Built-in performance metrics and monitoring
- 🛡️ **Error Handling**: Comprehensive error handling with custom error types
- 📝 **TypeScript Support**: Full TypeScript support with detailed type definitions
- 🔍 **Logging**: Configurable logging with multiple logger implementations

## Currently Supported Providers

- ✅ **Gemini AI** (Google) - Fully implemented
- 🚧 **OpenAI** - Planned
- 🚧 **Claude/Anthropic** - Planned

## Installation

```bash
npm install @mabar/ai-services
```

## Quick Start

### Basic Usage

```typescript
import { createGeminiService } from '@mabar/ai-services'

// Create a Gemini service
const aiService = createGeminiService('your-api-key')

// Analyze user intent
const intent = await aiService.analyzeIntent(
  'Find me a padel court tomorrow evening',
  { skillLevel: 'intermediate', location: 'Jakarta' }
)

// Generate a response
const response = await aiService.generateResponse({
  data: { courts: [], players: [] },
  context: {
    originalMessage: 'Find me a padel court tomorrow evening',
    userProfile: { skillLevel: 'intermediate' },
    language: 'en'
  }
})
```

### Using Environment Configuration

```typescript
import { AIServices } from '@mabar/ai-services'

// Set environment variables
// GEMINI_API_KEY=your-api-key
// GEMINI_MODEL=gemini-pro
// GEMINI_TEMPERATURE=0.7

const aiServices = AIServices.getInstance()
const geminiService = aiServices.createService('gemini')

// Service is automatically configured from environment
```

### Advanced Configuration

```typescript
import { createService, GeminiConfig } from '@mabar/ai-services'

const config: GeminiConfig = {
  provider: 'gemini',
  apiKey: 'your-api-key',
  model: 'gemini-1.5-pro',
  temperature: 0.8,
  maxTokens: 4096,
  timeout: 45000,
  generationConfig: {
    topP: 0.9,
    topK: 40
  }
}

const service = createService('gemini', config.apiKey, config)
```

## API Reference

### Core Interfaces

#### IAIService

The main interface that all AI providers implement:

```typescript
interface IAIService {
  analyzeIntent(message: string, userProfile?: UserProfile, language?: string): Promise<IntentAnalysis>
  generateResponse(request: NLGRequest): Promise<string>
  healthCheck(): Promise<HealthCheckResult>
  getConfig(): AIServiceConfig
  setLogger(logger: ILogger): void
  getMetrics(): PerformanceMetrics[]
  clearMetrics(): void
}
```

#### IntentAnalysis

Result of intent analysis:

```typescript
interface IntentAnalysis {
  type: 'matchmaking' | 'casual' | 'help' | 'greeting' | 'booking' | 'information'
  subtype?: string
  confidence: number
  extractedData: {
    timePreferences?: { preferred?: string; flexible: string[]; timeOfDay?: string }
    locationPreferences?: { primary?: string; radius: number; alternatives: string[] }
    skillRequirements?: { level?: string; flexibility: string }
    sessionType: 'casual' | 'competitive' | 'training'
    groupSize: 'singles' | 'doubles'
    additionalRequirements?: string[]
  }
  functionCalls: FunctionCall[]
}
```

### Services

#### GeminiService

```typescript
import { GeminiService, GeminiConfig } from '@mabar/ai-services'

const config: GeminiConfig = {
  provider: 'gemini',
  apiKey: 'your-api-key',
  model: 'gemini-pro'
}

const service = new GeminiService(config)

// Check model capabilities
const supportsImages = service.supportsFeature('image')
const modelInfo = service.getModelInfo()

// Estimate token usage
const tokenCount = service.estimateTokenCount('Your text here')
```

### Factory

#### AIServiceFactory

```typescript
import { AIServiceFactory } from '@mabar/ai-services'

const factory = AIServiceFactory.getInstance()

// Create service
const service = factory.createService(config)

// Get available providers
const providers = factory.getAvailableProviders() // ['gemini']

// Validate configuration
const isValid = factory.validateConfig(config)
```

### Configuration

#### ConfigManager

```typescript
import { ConfigManager } from '@mabar/ai-services'

const configManager = ConfigManager.getInstance()

// Load from environment
const configs = configManager.loadFromEnvironment()

// Create configuration
const config = configManager.createConfig('gemini', 'api-key', { temperature: 0.8 })

// Check if provider is configured
const isConfigured = configManager.isProviderConfigured('gemini')
```

## Environment Variables

### Gemini Configuration

```bash
GEMINI_API_KEY=your-gemini-api-key          # Required
GOOGLE_API_KEY=your-google-api-key          # Alternative to GEMINI_API_KEY
GEMINI_MODEL=gemini-pro                     # Optional, default: gemini-pro
GEMINI_TEMPERATURE=0.7                      # Optional, default: 0.7
GEMINI_MAX_TOKENS=2048                      # Optional, default: 2048
GEMINI_TIMEOUT=30000                        # Optional, default: 30000ms
```

### Logging Configuration

```bash
AI_LOG_LEVEL=info                           # debug, info, warn, error
```

## Error Handling

The package provides comprehensive error handling with custom error types:

```typescript
import { 
  AIServiceError, 
  ConfigurationError, 
  APIError, 
  TimeoutError, 
  ValidationError 
} from '@mabar/ai-services'

try {
  const result = await aiService.analyzeIntent('Hello')
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message, error.details)
  } else if (error instanceof TimeoutError) {
    console.error('Timeout Error:', error.message)
  } else if (error instanceof ConfigurationError) {
    console.error('Configuration Error:', error.message)
  }
}
```

## Performance Monitoring

Built-in performance monitoring tracks operation duration and success rates:

```typescript
// Get performance metrics
const metrics = aiService.getMetrics()

// Use performance monitor directly
import { PerformanceMonitor } from '@mabar/ai-services'

const monitor = new PerformanceMonitor()
const summary = monitor.getOperationSummary('analyzeIntent')

console.log(`Average duration: ${summary.averageDuration}ms`)
console.log(`Success rate: ${summary.successRate * 100}%`)
```

## Logging

Multiple logger implementations available:

```typescript
import { createLogger, ConsoleLogger, StructuredLogger } from '@mabar/ai-services'

// Console logger (default)
const logger = createLogger('console', 'debug')

// Structured logger (for testing/analysis)
const structuredLogger = new StructuredLogger()
aiService.setLogger(structuredLogger)

// Get logs
const logs = structuredLogger.getLogs()
```

## Health Checks

Monitor service health:

```typescript
// Single service health check
const health = await aiService.healthCheck()
console.log(`Status: ${health.status}`) // healthy, degraded, unhealthy

// All services health check
import { getHealthStatus } from '@mabar/ai-services'
const allHealth = await getHealthStatus()
```

## Integration Examples

### Frontend Integration (Vue.js)

```typescript
// In your Vue component
import { createGeminiService } from '@mabar/ai-services'

export default {
  async mounted() {
    this.aiService = createGeminiService()
  },
  
  methods: {
    async processUserMessage(message: string) {
      try {
        const intent = await this.aiService.analyzeIntent(message, this.userProfile)
        
        if (intent.type === 'matchmaking') {
          // Handle matchmaking request
          this.handleMatchmaking(intent)
        } else {
          // Generate casual response
          const response = await this.aiService.generateResponse({
            data: {},
            context: {
              originalMessage: message,
              userProfile: this.userProfile,
              language: 'en'
            }
          })
          
          this.addMessage(response)
        }
      } catch (error) {
        console.error('AI processing error:', error)
        this.showErrorMessage()
      }
    }
  }
}
```

### Backend Integration (Node.js/Cloud Functions)

```typescript
// In your cloud function
import { createGeminiService } from '@mabar/ai-services'

const aiService = createGeminiService(process.env.GEMINI_API_KEY)

export async function processMatchmakingRequest(request) {
  const { message, userProfile, language } = request.params
  
  try {
    // Analyze intent
    const intent = await aiService.analyzeIntent(message, userProfile, language)
    
    // Process based on intent
    if (intent.type === 'matchmaking') {
      // Execute function calls, query database, etc.
      const data = await processMatchmakingIntent(intent)
      
      // Generate response
      const response = await aiService.generateResponse({
        data,
        context: { originalMessage: message, userProfile, language }
      })
      
      return { success: true, data: { naturalLanguage: response, structuredData: data } }
    }
    
    return { success: true, data: { naturalLanguage: 'How can I help you?' } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] OpenAI service implementation
- [ ] Claude/Anthropic service implementation
- [ ] Streaming responses support
- [ ] Function calling support
- [ ] Image/multimodal support
- [ ] Caching layer
- [ ] Rate limiting
- [ ] Retry mechanisms
- [ ] Batch processing
- [ ] Plugin system
