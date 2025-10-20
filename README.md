# AI-Powered Chatbot for Brain Health and Dementia Support

## Project Overview

This project is a comprehensive digital health companion designed to support brain health and provide dementia care for New Zealand's aging population. It combines an AI-powered conversational interface with clinical assessment tools, cognitive stimulation activities, and personalized care management features.

## Key Features

### 1. **Intelligent Conversational AI**

- **Large Language Model Integration**: Utilizes Google Gemini for natural, context-aware conversations
- **Retrieval-Augmented Generation (RAG)**: Ensures accurate, evidence-based responses by retrieving information from trusted medical sources
- **Multi-language Support**: Offers conversations in English, Chinese, French, German, and Russian
- **Personalized Interactions**: Learns and remembers user information to provide tailored support

### 2. **Dementia Pre-Assessment Module**

- **Clinical Assessment Framework**: Implements evidence-based cognitive screening inspired by Mini-ACE assessments
- **Intelligent Response Evaluation**: Uses LLM to assess answer correctness with natural language understanding
- **Progress Tracking**: Stores assessment results for longitudinal monitoring

### 3. **Cognitive Stimulation Activities**

- **Pattern Matching Game**: Visual memory exercise with increasing difficulty levels
- **Category Sorting Game**: Tests cognitive flexibility and reasoning through drag-and-drop classification
- **Performance Analytics**: Tracks scores and progress across multiple game sessions
- **Adaptive Difficulty**: Progressively challenging levels to maintain engagement

### 4. **Calendar and Reminder System**

- **Smart Calendar Integration**: Full-featured calendar with day, week, month, and agenda views
- **Natural Language Event Creation**: Add events through conversation with the AI assistant
- **ICS File Import**: Import events from external calendar applications
- **Category-Based Organization**: Color-coded events (Work, Personal, Family, Social, Health)
- **Smart Event Management**: LLM-powered calendar functions for finding, updating, and deleting events using natural language

### 5. **Advanced Accessibility Features**

- **Text-to-Speech (TTS)**: Google Cloud TTS with adjustable speech rate (0.4x - 2.0x)
- **Speech-to-Text (STT)**: Voice input for hands-free interaction
- **Adjustable Font Sizes**: User-controlled text scaling for visual accessibility
- **Dementia-Friendly UI**: High contrast, large buttons, simplified navigation
- **Multi-modal Input**: Support for text, voice, and touch interactions

### 6. **User Memory and Context Management**

- **Fact Extraction Service**: Automatically extracts and stores user information from conversations
- **Persistent User Profiles**: Maintains detailed health, lifestyle, and preference information
- **Conversation History**: Remembers previous interactions for contextual responses
- **Privacy Controls**: User-managed data visibility and sharing settings

## Technical Architecture

### **Frontend** (React 19)

- Modern component-based architecture
- Context API for global state management
- React Big Calendar for schedule visualization
- React DatePicker for user-friendly date selection
- Axios for API communication
- Responsive design optimized for elderly users

### **Backend** (ASP.NET Core 8.0)

- RESTful API architecture
- Clean separation of concerns (Controllers, Services, Repositories)
- Entity Framework Core with SQLite database
- Microsoft Semantic Kernel for LLM orchestration
- Google Cloud integrations (Gemini, TTS, STT)

### **AI & ML Components**

- **LLM Service**: Google Gemini integration with function calling
- **RAG Pipeline**: Vector similarity search for knowledge retrieval
- **Fact Extraction**: Automated user information extraction from conversations
- **Assessment Evaluation**: Intelligent response scoring using natural language understanding

### **External Services**

- **Google Gemini**: Primary LLM for conversational AI
- **Google Cloud Text-to-Speech**: High-quality voice synthesis
- **Google Cloud Speech-to-Text**: Accurate voice recognition with New Zealand English support

## Project Structure

```
├── Backend/
│   └── ChatbotBackend/
│       ├── Controllers/          # API endpoints
│       ├── Services/             # Business logic
│       │   ├── LLMService.cs             # LLM orchestration
│       │   ├── DementiaAssessmentService.cs
│       │   ├── FactExtractionService.cs
│       │   ├── TTSService.cs
│       │   └── STTService.cs
│       ├── Repositories/         # Data access layer
│       ├── Model/               # Data models
│       └── CognitiveGames/      # Brain training activities
│
└── Frontend/
    └── ChatbotFrontend/
        ├── src/
        │   ├── components/
        │   │   ├── chatComponent/           # AI conversation interface
        │   │   ├── brainExercisesComponent/ # Cognitive games
        │   │   ├── dailyRemindersComponent/ # Calendar system
        │   │   └── shared/                  # Reusable components
        │   ├── contexts/         # Global state management
        │   ├── api/             # Backend communication
        │   └── utils/           # Helper functions
```

## Key Innovation: Smart Calendar Integration

A unique technical achievement is the natural language calendar management system:

- **Fuzzy Matching Algorithm**: Combines Levenshtein distance and Jaccard similarity to find events from partial/misspelled names
- **Smart Event Functions**:
  - `find_best_matching_event`: Locates events with confidence scoring
  - `smart_update_event`: Updates events using natural descriptions
  - `smart_delete_event`: Removes events via conversational commands
- **Confidence Thresholding**: Ensures accurate event identification before modifications

## Clinical Assessment Innovation

The dementia pre-assessment module represents a sophisticated integration of clinical practice with AI:

- **Multi-modal Question Types**: Adapts UI behavior based on assessment requirements
- **Temporal Memory Testing**: Implements delayed recall with automatic hiding of stimuli
- **Verbal-Only Constraints**: Enforces voice-only responses for specific cognitive tests
- **Timed Assessments**: Provides countdown timers with automatic progression

## User-Centered Design for Elderly Users

Special considerations for the target demographic:

- **High Contrast UI**: Navy background with light text for improved readability
- **Simplified Navigation**: Clear visual hierarchy with minimal cognitive load
- **Empathetic Communication**: LLM prompts designed for supportive, patient interaction

## Cultural Sensitivity (New Zealand Context)

- Word recall games feature NZ-themed vocabulary (Kiwi, Pavlova, Kumara)
- Support for diverse ethnic communities through multi-language capability
- Timezone handling for NZ (including daylight saving considerations)
- Integration with local healthcare context and support services

## Future Development Roadmap

As outlined in the technical progress report:

1. **Enhanced RAG Pipeline**: Expand knowledge base with NZ-specific health information
2. **Comprehensive User Testing**: Usability studies with elderly participants and diverse ethnic groups
3. **Cloud Deployment**: Scalable infrastructure with healthcare compliance (HIPAA-equivalent)
4. **Performance Optimization**: Database query optimization, caching strategies, load balancing
5. **Advanced Analytics**: Longitudinal tracking of cognitive performance and engagement patterns

## Research Objectives Achieved

✅ Developed AI-powered chatbot tailored for NZ brain health context  
✅ Integrated dementia pre-assessment module with behavioral pattern analysis  
✅ Implemented cognitive stimulation activities (pattern matching, category sorting)  
✅ Created dementia-friendly UI with TTS/STT functionality  
✅ Built calendar and reminder system for daily routine support  
✅ Designed companionship features to reduce social isolation

## Technologies Used

**Frontend**: React 19, React Router, Axios, React Big Calendar, React DatePicker  
**Backend**: ASP.NET Core 8.0, Entity Framework Core, SQLite  
**AI/ML**: Microsoft Semantic Kernel, Google Gemini, Google Cloud TTS/STT  
**Authentication**: JWT-based (user context management)  
**Deployment**: Development environment (production deployment planned)

## Getting Started

### Prerequisites

- Node.js (for frontend)
- .NET 8.0 SDK (for backend)
- Google Cloud API credentials (for TTS/STT/Gemini)

### Backend Setup

```bash
cd Backend/ChatbotBackend
dotnet restore
dotnet run
```

### Frontend Setup

```bash
cd Frontend/ChatbotFrontend
npm install
npm run dev
```

### API Setup

### Google TTS and STT setup

To setup the api for TTS and STT include a file called "tts-api-key.json" in the following directory "Backend/ChatbotBackend".
The file should include the following key value pairs (the values should be provided from your google account details.).

{
"type": "",
"project_id": "",
"private_key_id": "",
"private_key": "",
"client_email": "",
"client_id": "",
"auth_uri": "",
"token_uri": "",
"auth_provider_x509_cert_url": "",
"client_x509_cert_url": "",
"universe_domain": ""
}

### API keys setup (both LLM and TTS features)

You should add the following to the CHatbotBackend.csproj user secrets.

{
"GoogleGenerativeAI:ApiKey": "",
"GoogleGenerativeAI:ModelId": "",
"GoogleGenerativeAI:EmbeddingModelId": "",
"GoogleCloud:ProjectId": "",
"GoogleCloud:KeyFilePath": ""
}
