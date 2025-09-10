# MaBar AI System

## Architecture

```
User → AICoordinatorService → AILogicService ↔ AIPresenterService → User
                                     ↓              ↑
                            MatchmakingToolbox ←→ UX Decisions
```

## Core Services

### AICoordinatorService
- Main entry point for all AI interactions
- Routes user input to appropriate AI services
- Handles conversation flow and error recovery

### AILogicService  
- Intent understanding and analysis
- Information gathering across conversation turns
- Database query execution via MatchmakingToolbox
- Communicates with AIPresenterService for UX decisions

### AIPresenterService
- UX optimization and response formatting
- Uses Google Gemini for intelligent presentation decisions
- Creates cards, text, or mixed format responses
- Handles edge cases and no-results scenarios

## Communication

AIs communicate through **direct method calls**:
```typescript
// AI Logic asks AI Presenter for UX advice
const strategy = await AILogicService.discussWithPresenter(findings)

// AI Presenter provides UX decision  
const decision = await AIPresenterService.discussWithLogic(findings, analysis)
```

## Testing

Use `comprehensiveAITest.ts` for all testing scenarios:
- Simple validation tests
- Complex multi-turn conversations
- Edge cases and error handling
- Performance testing

## Usage

```typescript
import { AICoordinatorService } from './services/aiCoordinatorService'

const response = await AICoordinatorService.processUserInput('Find padel court in Kedoya tomorrow 7pm')
```