# Meraki - Hybrid Chrome Extension + Web Dashboard

A comprehensive productivity system that helps users capture, organize, and act on information across the web. Inspired by daily.dev's extension-first workflow but enhanced with bookmarking, note-taking, and AI-powered features.

## 🌟 Overview

Meraki is a hybrid system consisting of:
- **Chrome Extension**: Primary interface for capturing web content
- **Web Dashboard**: Comprehensive management interface
- **Mobile App**: Task-focused companion for productivity on-the-go
- **Backend**: Firebase-powered sync and storage

## 🏗 Architecture

### Extension (Meraki Core)
```
Chrome Extension
├── Toolbar Icon (next to omnibox)
├── Translucent Overlay Panel
│   ├── Notes Management
│   ├── Bookmarks with Metadata
│   ├── YouTube Timestamp Notes
│   ├── Shopping/Booking Records
│   └── AI Summarization (TODO)
└── Task Records Dashboard
```

### Backend (Firebase)
```
Firebase Services
├── Authentication (Google Sign-In)
├── Firestore (Data Storage)
├── Storage (Attachments)
└── Functions (API Endpoints)
```

### Mobile App (React Native)
```
Meraki Companion
├── Task Management
├── Notes & Bookmarks Viewer
├── Day Planning
├── Sync with Extension
└── Offline Support
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Chrome browser for extension testing
- Firebase account for backend services

### Extension Setup
```bash
# Install dependencies
npm install

# Development build
npm run dev

# Production build
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select dist folder
```

### Mobile App Setup
```bash
cd mobile-app
npm install
npm start
```

## 📊 Data Model

### Firestore Structure
```typescript
User {
  uid: string;
  profile: {
    name: string;
    email: string;
    photo: string;
  };
  records: Record[];
}

Record {
  id: string;
  type: "note" | "bookmark" | "task";
  source: "youtube" | "shopping" | "booking" | "generic";
  url: string;
  title: string;
  metadata: {
    favicon?: string;
    timestamp?: number; // For YouTube
    price?: string; // For shopping
    tags?: string[];
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🔧 Core Features

### Extension Features
- **Toolbar Integration**: One-click access next to Chrome omnibox
- **Overlay Panel**: Non-intrusive content capture without page reload
- **Smart Detection**: Auto-detect YouTube videos, shopping sites, booking platforms
- **Timestamp Notes**: Attach notes to specific video timestamps
- **Metadata Capture**: Automatic title, URL, favicon extraction
- **Task Records**: Unified dashboard for all captured content

### Mobile Features
- **Task-First Design**: Optimized for productivity and planning
- **Sync Integration**: Real-time sync with extension data
- **Day Planning**: Create and manage daily tasks
- **Rich Notes**: Attach links, photos, reminders to tasks
- **Theme Customization**: Personalized UI themes
- **Smart Reminders**: Time-based and location-based notifications

### Backend Features
- **Real-time Sync**: Instant data synchronization across devices
- **Offline Support**: Local storage with sync queue
- **Secure Auth**: Google Sign-In integration
- **Scalable Storage**: Firebase Firestore for structured data

## 🛠 Technology Stack

### Frontend
- **Extension**: React + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo
- **State Management**: Zustand with persistence
- **UI Components**: Custom components with Framer Motion

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Sign-In)
- **Storage**: Firebase Storage
- **Functions**: Firebase Cloud Functions (when needed)

### Development Tools
- **Build Tool**: Vite
- **Package Manager**: npm
- **Linting**: ESLint + TypeScript
- **Styling**: Tailwind CSS + PostCSS

## 📱 Mobile App Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Note Integration**: View and edit notes from extension
- **Bookmark Access**: Quick access to saved bookmarks
- **Sync Status**: Real-time sync indicators

### Advanced Features
- **Smart Task Creation**: AI-powered task parsing (TODO)
- **Rich Media**: Attach photos, links, voice notes
- **Reminders**: Time-based and location-based alerts
- **Themes**: Customizable UI themes and backgrounds
- **Offline Mode**: Full functionality without internet

### Planned Features (TODO)
- **AI Task Parsing**: Natural language to structured tasks
- **Smart Suggestions**: Context-aware task recommendations
- **Collaboration**: Shared tasks and notes
- **Analytics**: Productivity insights and patterns

## 🔮 AI Integration (TODO)

### Planned AI Features
- **Content Summarization**: Auto-summarize web pages and videos
- **Smart Tagging**: Automatic tag suggestions
- **Task Extraction**: Convert notes to actionable tasks
- **Context Awareness**: Understand user intent and preferences

### AI Technologies to Integrate
- **Chrome AI APIs**: Built-in browser AI capabilities
- **Google Gemini**: Advanced language understanding
- **Firebase ML**: On-device and cloud ML models

## 🧪 Development Workflow

### Extension Development
1. Make changes to source files
2. Run `npm run dev` for hot reload
3. Reload extension in Chrome
4. Test on various websites

### Mobile Development
1. Start Expo development server
2. Use Expo Go app for testing
3. Test on both iOS and Android
4. Verify sync with extension

### Backend Development
1. Set up Firebase project
2. Configure authentication and Firestore
3. Deploy security rules
4. Test API endpoints

## 📄 Project Structure

```
meraki/
├── src/                    # Extension source code
│   ├── components/         # React components
│   ├── services/          # Business logic
│   ├── store/             # State management
│   ├── content/           # Content scripts
│   └── background/        # Background scripts
├── mobile-app/            # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   ├── components/    # Mobile components
│   │   └── services/      # Mobile services
│   └── app.json          # Expo configuration
├── firebase/              # Firebase configuration
├── dist/                  # Built extension files
└── docs/                  # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.