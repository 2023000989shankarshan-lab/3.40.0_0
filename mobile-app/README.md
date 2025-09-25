# Meraki Mobile Companion

React Native mobile app for the Meraki productivity system. Task-focused companion that syncs with the Chrome extension and provides comprehensive task management capabilities.

## 🎯 Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Extension Sync**: Real-time sync with Meraki Chrome extension
- **Rich Notes**: View and edit notes captured from web browsing
- **Smart Bookmarks**: Access saved bookmarks with metadata
- **Offline Support**: Full functionality without internet connection

### Advanced Task Features
- **Smart Task Creation**: Natural language task parsing (TODO: AI integration)
- **Rich Attachments**: Photos, links, voice notes, documents
- **Flexible Reminders**: Time-based, location-based, recurring
- **Custom Themes**: Personalized backgrounds and UI themes
- **Quick Capture**: Voice-to-task, photo-to-task conversion

### Productivity Features
- **Day Planning**: Daily task organization and scheduling
- **Progress Tracking**: Visual progress indicators and statistics
- **Focus Mode**: Distraction-free task execution
- **Habit Tracking**: Recurring task patterns and streaks

## 🏗 Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: React Navigation v6
- **UI Components**: Custom components with React Native Elements
- **Animations**: React Native Reanimated v3
- **Notifications**: Expo Notifications
- **Camera/Media**: Expo Camera and ImagePicker

### Data Flow
```
Chrome Extension → Firebase → Mobile App
                     ↓
              Local Storage (AsyncStorage)
                     ↓
              Zustand Store → React Components
```

### Project Structure
```
mobile-app/
├── src/
│   ├── screens/           # Main app screens
│   │   ├── DashboardScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── NotesScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SyncScreen.tsx
│   ├── components/        # Reusable components
│   │   ├── TaskCard.tsx
│   │   ├── NoteCard.tsx
│   │   ├── QuickActions.tsx
│   │   └── ThemeProvider.tsx
│   ├── services/          # Business logic
│   │   ├── syncService.ts
│   │   ├── storageService.ts
│   │   ├── notificationService.ts
│   │   └── aiService.ts (TODO)
│   ├── store/            # State management
│   │   ├── taskStore.ts
│   │   ├── noteStore.ts
│   │   └── settingsStore.ts
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── assets/               # Images, fonts, etc.
└── app.json             # Expo configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on physical device (for testing)

### Installation
```bash
cd mobile-app
npm install
```

### Development
```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Building
```bash
# Development build
expo build:ios --type simulator
expo build:android --type apk

# Production build
expo build:ios --type archive
expo build:android --type app-bundle
```

## 📱 Screen Specifications

### Dashboard Screen
- **Overview**: Daily task summary, quick stats, recent activity
- **Quick Actions**: Add task, voice note, photo capture
- **Widgets**: Weather, calendar events, habit streaks
- **Navigation**: Bottom tab navigation to other screens

### Tasks Screen
- **Views**: List, Kanban board, Calendar, Timeline
- **Filtering**: By priority, due date, tags, completion status
- **Sorting**: Manual drag-and-drop, automatic by criteria
- **Bulk Actions**: Mark complete, delete, move to collection

### Task Creation/Editing
- **Smart Input**: Natural language parsing (TODO: AI)
- **Rich Content**: 
  - Text with markdown support
  - Photo attachments from camera/gallery
  - Voice recordings with transcription
  - Link previews and metadata
  - Location tagging
- **Scheduling**:
  - Due dates with time
  - Recurring patterns (daily, weekly, custom)
  - Reminder notifications
  - Time blocking integration

### Notes Screen
- **Extension Sync**: Notes captured from web browsing
- **Rich Viewing**: Formatted text, images, links
- **Search**: Full-text search across all notes
- **Organization**: Tags, collections, favorites

### Bookmarks Screen
- **Web Integration**: Bookmarks saved from extension
- **Metadata Display**: Favicon, title, description, tags
- **Quick Access**: Open in browser, share, organize
- **Collections**: Folder-based organization

### Settings Screen
- **Sync Configuration**: Firebase connection, sync frequency
- **Notifications**: Reminder settings, quiet hours
- **Themes**: Light/dark mode, custom backgrounds
- **Privacy**: Data export, account management

## 🔄 Sync Implementation

### Firebase Integration
```typescript
// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "meraki-app.firebaseapp.com",
  projectId: "meraki-app",
  storageBucket: "meraki-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Real-time sync with Firestore
const syncService = {
  // Sync tasks from extension
  syncTasks: async () => {
    const snapshot = await db.collection('users')
      .doc(userId)
      .collection('records')
      .where('type', '==', 'task')
      .onSnapshot(handleTaskUpdates);
  },
  
  // Push local changes to Firebase
  pushChanges: async (changes) => {
    const batch = db.batch();
    changes.forEach(change => {
      const ref = db.collection('users')
        .doc(userId)
        .collection('records')
        .doc(change.id);
      batch.set(ref, change.data, { merge: true });
    });
    await batch.commit();
  }
};
```

### Offline Support
- **Local Storage**: AsyncStorage for offline data persistence
- **Sync Queue**: Queue changes when offline, sync when online
- **Conflict Resolution**: Last-write-wins with user override option
- **Status Indicators**: Clear sync status throughout the app

## 🎨 UI/UX Design

### Design System
- **Colors**: 
  - Primary: #667eea (Meraki Blue)
  - Secondary: #764ba2 (Meraki Purple)
  - Success: #10b981
  - Warning: #f59e0b
  - Error: #ef4444
- **Typography**: 
  - Headers: Inter Bold
  - Body: Inter Regular
  - Monospace: JetBrains Mono
- **Spacing**: 8px grid system
- **Animations**: Smooth 300ms transitions, spring physics

### Theme System
```typescript
interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    // ... more colors
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    body: TextStyle;
    // ... more styles
  };
}

// Custom theme support
const customThemes = {
  ocean: { /* blue theme */ },
  forest: { /* green theme */ },
  sunset: { /* orange theme */ },
  midnight: { /* dark theme */ }
};
```

## 🔮 AI Integration (TODO)

### Planned AI Features
- **Smart Task Parsing**: Convert natural language to structured tasks
- **Content Summarization**: Auto-summarize long notes and articles
- **Smart Reminders**: Context-aware reminder suggestions
- **Productivity Insights**: AI-powered productivity analytics

### AI Technologies to Integrate
- **Google ML Kit**: On-device text recognition and translation
- **Firebase ML**: Cloud-based natural language processing
- **OpenAI API**: Advanced text processing and generation
- **Custom Models**: Task-specific AI models for productivity

### Implementation Plan
1. **Phase 1**: Basic text processing and task parsing
2. **Phase 2**: Smart suggestions and auto-categorization
3. **Phase 3**: Predictive features and advanced analytics
4. **Phase 4**: Conversational AI assistant

## 📊 Data Models

### Task Model
```typescript
interface MobileTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Mobile-specific fields
  attachments: Attachment[];
  reminders: Reminder[];
  location?: Location;
  voiceNote?: string;
  photos: string[];
  tags: string[];
  
  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: string;
  sourceDevice: 'mobile' | 'extension';
}
```

### Attachment Model
```typescript
interface Attachment {
  id: string;
  type: 'photo' | 'voice' | 'link' | 'document';
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}
```

### Reminder Model
```typescript
interface Reminder {
  id: string;
  type: 'time' | 'location' | 'recurring';
  trigger: {
    time?: string; // ISO date string
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
    recurring?: {
      pattern: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: string;
    };
  };
  message: string;
  enabled: boolean;
  notificationId?: string;
}
```

## 🧪 Testing Strategy

### Unit Tests
- Component rendering and behavior
- Service layer functionality
- Store state management
- Utility functions

### Integration Tests
- Firebase sync operations
- Notification scheduling
- Camera and media integration
- Deep linking functionality

### E2E Tests
- Complete user workflows
- Cross-platform sync testing
- Offline/online scenarios
- Performance benchmarks

## 🚀 Deployment

### App Store Deployment
1. **iOS App Store**:
   - Apple Developer Account required
   - App Store Connect configuration
   - TestFlight beta testing
   - App Review process

2. **Google Play Store**:
   - Google Play Console setup
   - Internal/Alpha/Beta testing tracks
   - Play Store review process

### Over-the-Air Updates
- **Expo Updates**: Instant updates for JavaScript changes
- **CodePush**: Alternative OTA update solution
- **Feature Flags**: Gradual feature rollouts

## 📄 TODO List

### Core Features (Priority 1)
- [ ] Complete task CRUD operations
- [ ] Firebase authentication integration
- [ ] Real-time sync with extension
- [ ] Offline storage and sync queue
- [ ] Push notifications for reminders
- [ ] Photo and voice note attachments

### Enhanced Features (Priority 2)
- [ ] AI-powered task parsing
- [ ] Smart reminder suggestions
- [ ] Advanced filtering and search
- [ ] Custom themes and backgrounds
- [ ] Location-based reminders
- [ ] Habit tracking integration

### Advanced Features (Priority 3)
- [ ] Collaboration and sharing
- [ ] Calendar integration
- [ ] Productivity analytics
- [ ] Widget support (iOS/Android)
- [ ] Apple Watch / Wear OS companion
- [ ] Siri Shortcuts / Google Assistant

### Technical Improvements
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Comprehensive testing suite
- [ ] CI/CD pipeline setup
- [ ] Error tracking and analytics
- [ ] Security audit and improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Write tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.