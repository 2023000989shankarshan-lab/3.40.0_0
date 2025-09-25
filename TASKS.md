# Meraki Development Roadmap & TODO

## 🎯 Project Overview
Meraki is a hybrid Chrome Extension + Web Dashboard system that helps users capture, organize, and act on information across the web. Inspired by daily.dev's extension-first workflow but enhanced with bookmarking, note-taking, and AI-powered features.

## 🏗 Architecture Overview

### Extension (Meraki Core)
- **Toolbar Integration**: Icon next to Chrome omnibox
- **Overlay Panel**: Translucent, non-intrusive content capture
- **Smart Detection**: Auto-detect YouTube, shopping, booking sites
- **Task Records Dashboard**: Unified view of all captured content

### Backend (Firebase)
- **Authentication**: Google Sign-In
- **Database**: Firestore for structured data
- **Storage**: Firebase Storage for attachments
- **Functions**: Cloud Functions for API endpoints

### Mobile App (React Native)
- **Task-First Design**: Productivity-focused companion
- **Rich Features**: Attachments, reminders, themes
- **Sync Integration**: Real-time sync with extension

## 📋 Development Tasks

### Phase 1: Core Infrastructure (Priority 1)

#### Extension Development
- [x] Project structure and build system
- [x] Manifest v3 configuration
- [x] Content script injection system
- [x] Background script message handling
- [x] Basic overlay panel implementation
- [ ] **Toolbar icon integration** (next to omnibox)
- [ ] **Context menu setup** (right-click options)
- [ ] **Smart site detection** (YouTube, shopping, booking)
- [ ] **Metadata extraction** (titles, favicons, timestamps)
- [ ] **Local storage system** (Chrome storage API)

#### Backend Setup
- [ ] **Firebase project configuration**
  - [ ] Authentication setup (Google Sign-In)
  - [ ] Firestore database structure
  - [ ] Security rules implementation
  - [ ] Storage bucket configuration
- [ ] **Data models implementation**
  - [ ] User profile schema
  - [ ] Record schema (notes, bookmarks, tasks)
  - [ ] Sync status tracking
- [ ] **API endpoints** (Cloud Functions)
  - [ ] User management
  - [ ] Record CRUD operations
  - [ ] Sync conflict resolution

#### Mobile App Foundation
- [x] React Native project setup with Expo
- [x] Navigation structure
- [x] Basic screen components
- [x] State management with Zustand
- [ ] **Firebase SDK integration**
- [ ] **Authentication flow**
- [ ] **Offline storage** (AsyncStorage)
- [ ] **Sync service implementation**

### Phase 2: Core Features (Priority 2)

#### Extension Features
- [ ] **YouTube Integration**
  - [ ] Video timestamp detection
  - [ ] Timestamp-based note taking
  - [ ] Video metadata extraction
  - [ ] Chapter/segment recognition
- [ ] **Shopping Site Integration**
  - [ ] Product information extraction
  - [ ] Price tracking capabilities
  - [ ] Wishlist/comparison features
  - [ ] Deal alert system
- [ ] **Booking Site Integration**
  - [ ] Travel itinerary capture
  - [ ] Hotel/flight comparison
  - [ ] Booking reminder system
  - [ ] Price change notifications

#### Mobile App Features
- [x] Task management interface
- [x] Task creation with rich features
- [ ] **Photo attachments** (camera integration)
- [ ] **Voice notes** (audio recording)
- [ ] **Location-based reminders**
- [ ] **Custom themes and backgrounds**
- [ ] **Notification system**
- [ ] **Widget support** (iOS/Android)

#### Sync System
- [ ] **Real-time synchronization**
  - [ ] Firestore real-time listeners
  - [ ] Conflict resolution algorithms
  - [ ] Offline queue management
  - [ ] Sync status indicators
- [ ] **Data migration tools**
- [ ] **Backup and restore functionality**

### Phase 3: Advanced Features (Priority 3)

#### AI Integration (TODO - Placeholder Implementation)
- [ ] **Content Summarization**
  - [ ] Chrome AI API integration
  - [ ] Google Gemini integration
  - [ ] Page content analysis
  - [ ] Video transcript summarization
- [ ] **Smart Tagging**
  - [ ] Automatic tag generation
  - [ ] Content categorization
  - [ ] Duplicate detection
- [ ] **Task Intelligence**
  - [ ] Natural language task parsing
  - [ ] Priority suggestion algorithms
  - [ ] Deadline prediction
  - [ ] Smart reminder timing
- [ ] **Productivity Insights**
  - [ ] Usage pattern analysis
  - [ ] Productivity metrics
  - [ ] Goal tracking
  - [ ] Habit formation support

#### Collaboration Features
- [ ] **Shared Collections**
  - [ ] Team workspaces
  - [ ] Permission management
  - [ ] Real-time collaboration
- [ ] **Social Features**
  - [ ] Public bookmark collections
  - [ ] Community recommendations
  - [ ] Social sharing integration

#### Advanced Mobile Features
- [ ] **Apple Watch / Wear OS Support**
- [ ] **Siri Shortcuts / Google Assistant**
- [ ] **Calendar Integration**
- [ ] **Email Integration**
- [ ] **Third-party App Integration**

### Phase 4: Polish & Optimization (Priority 4)

#### Performance Optimization
- [ ] **Extension Performance**
  - [ ] Content script optimization
  - [ ] Memory usage reduction
  - [ ] Startup time improvement
- [ ] **Mobile Performance**
  - [ ] App startup optimization
  - [ ] Smooth animations
  - [ ] Battery usage optimization
- [ ] **Backend Optimization**
  - [ ] Database query optimization
  - [ ] CDN implementation
  - [ ] Caching strategies

#### User Experience
- [ ] **Onboarding Flow**
  - [ ] Interactive tutorials
  - [ ] Feature discovery
  - [ ] Setup wizards
- [ ] **Accessibility**
  - [ ] Screen reader support
  - [ ] Keyboard navigation
  - [ ] High contrast themes
- [ ] **Internationalization**
  - [ ] Multi-language support
  - [ ] Localized content
  - [ ] RTL language support

#### Quality Assurance
- [ ] **Testing Suite**
  - [ ] Unit tests (Jest)
  - [ ] Integration tests
  - [ ] E2E tests (Playwright)
  - [ ] Mobile testing (Detox)
- [ ] **Error Handling**
  - [ ] Comprehensive error tracking
  - [ ] User-friendly error messages
  - [ ] Automatic error reporting
- [ ] **Security Audit**
  - [ ] Penetration testing
  - [ ] Data encryption audit
  - [ ] Privacy compliance check

## 🛠 Technical Implementation Details

### Extension Architecture
```
src/
├── background/          # Service worker
├── content/            # Content scripts
├── components/         # React components
├── services/          # Business logic
├── store/             # State management
└── types/             # TypeScript definitions
```

### Firebase Schema
```typescript
// Firestore Collections
users/{userId}/
├── profile: UserProfile
└── records/{recordId}: Record

// Record Types
Record {
  type: 'note' | 'bookmark' | 'task'
  source: 'youtube' | 'shopping' | 'booking' | 'generic'
  metadata: { /* source-specific data */ }
  content: string
  // ... other fields
}
```

### Mobile App Architecture
```
mobile-app/src/
├── screens/           # Main app screens
├── components/        # Reusable components
├── services/          # Business logic
├── store/             # State management
├── types/             # TypeScript definitions
└── utils/             # Helper functions
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Chrome browser
- Firebase account
- Expo CLI (for mobile)
- iOS Simulator / Android Emulator

### Quick Start
```bash
# Extension development
npm install
npm run dev

# Mobile app development
cd mobile-app
npm install
npm start

# Firebase setup
firebase login
firebase init
```

## 📊 Success Metrics

### User Engagement
- Daily active users (DAU)
- Session duration
- Feature adoption rates
- User retention (7-day, 30-day)

### Functionality Metrics
- Sync success rate
- Error rates
- Performance benchmarks
- User satisfaction scores

### Business Metrics
- User growth rate
- Feature usage analytics
- Support ticket volume
- App store ratings

## 🚀 Deployment Strategy

### Extension Deployment
1. Chrome Web Store submission
2. Edge Add-ons store
3. Firefox Add-ons (future)

### Mobile App Deployment
1. iOS App Store
2. Google Play Store
3. TestFlight/Internal testing

### Backend Deployment
1. Firebase hosting
2. Cloud Functions deployment
3. Firestore security rules
4. Monitoring and alerts

## 📝 Documentation Plan

### User Documentation
- [ ] Getting started guide
- [ ] Feature tutorials
- [ ] FAQ and troubleshooting
- [ ] Video walkthroughs

### Developer Documentation
- [ ] API documentation
- [ ] Architecture overview
- [ ] Contributing guidelines
- [ ] Deployment procedures

### Technical Documentation
- [ ] Database schema
- [ ] Security protocols
- [ ] Performance guidelines
- [ ] Testing procedures

## 🔮 Future Considerations

### Scalability
- Microservices architecture
- Database sharding
- CDN implementation
- Load balancing

### Platform Expansion
- Safari extension
- Desktop applications
- Web dashboard
- API for third-party integrations

### Advanced AI Features
- Custom AI model training
- Personalized recommendations
- Predictive analytics
- Natural language processing

---

## 📅 Timeline Estimates

- **Phase 1** (Core Infrastructure): 4-6 weeks
- **Phase 2** (Core Features): 6-8 weeks
- **Phase 3** (Advanced Features): 8-10 weeks
- **Phase 4** (Polish & Optimization): 4-6 weeks

**Total Estimated Timeline**: 22-30 weeks (5.5-7.5 months)

## 👥 Team Recommendations

### Roles Needed
- Frontend Developer (Extension + React)
- Mobile Developer (React Native)
- Backend Developer (Firebase/Node.js)
- UI/UX Designer
- QA Engineer
- DevOps Engineer (part-time)

### Skills Required
- TypeScript/JavaScript
- React/React Native
- Chrome Extension APIs
- Firebase/Firestore
- Mobile development (iOS/Android)
- AI/ML integration (future)

---

*This roadmap is a living document and will be updated as the project evolves.*