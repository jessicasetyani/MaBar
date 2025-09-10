# MaBar AI Quick Reference

## 🚀 Key Files
- `aiCoordinatorService.ts` - Main AI entry point
- `aiConversationManager.ts` - Core conversation logic  
- `aiFlowLogger.ts` - Logging system
- `AI_ARCHITECTURE.md` - Complete documentation

## 🔄 AI Flow Summary
```
User Input → AI Thinking → Toolbox Action → AI Presentation → User Response
```

## 🧠 AI Modes
1. **Conversation** - Natural dialogue and questions
2. **Search** - Intelligent database queries
3. **Presentation** - Dynamic result formatting

## 📊 Logging Output
```
🚀 [AI FLOW] Starting session
👤 [USER → AI] User message
🧠 [AI THINKING] AI decision process
🔧 [AI → TOOLBOX] Database request
🔧 [TOOLBOX → AI] Database response
🎨 [AI PRESENTATION] Format decision
🎯 [AI → USER] Final response
✅ [AI FLOW] Session completed
```

## 🎯 Example Conversation
```
User: "hello"
AI: [Thinks: User is greeting, should respond naturally]
"Hi! How can I help you with padel today?"

User: "tomorrow morning"  
AI: [Thinks: User wants to play, has time, needs location]
"Great! Which area works for you?"

User: "kedoya"
AI: [Thinks: Now I have enough context to search]
[Searches venues] "Found 8 courts in Kedoya!"
```

## 🔧 Toolbox Actions
- `findVenues` - Search courts
- `findPlayers` - Search players
- `findSessions` - Search existing games
- `createSession` - Guide session creation

## 🎨 Smart Features
- **True Intelligence** - No hardcoded rules, pure AI reasoning
- **Context Memory** - Remembers conversation history
- **Dynamic Responses** - Adapts to each unique situation
- **Responsible AI** - Only real database data, no hallucinations