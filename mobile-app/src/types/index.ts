// Mobile app types for Meraki system

export interface Task {
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
  tags: string[];
  
  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: string;
  sourceDevice: 'mobile' | 'extension';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  url?: string;
  domain?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Mobile-specific fields
  attachments: Attachment[];
  
  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: string;
  sourceDevice: 'mobile' | 'extension';
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  tags: string[];
  collections: string[];
  createdAt: string;
  updatedAt: string;
  
  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: string;
  sourceDevice: 'mobile' | 'extension';
}

export interface Attachment {
  id: string;
  type: 'photo' | 'voice' | 'link' | 'document';
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: 'time' | 'location' | 'recurring';
  trigger: {
    time?: string; // ISO date string
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
      name?: string;
    };
    recurring?: {
      pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
      interval: number;
      endDate?: string;
      daysOfWeek?: number[]; // 0-6, Sunday = 0
    };
  };
  message: string;
  enabled: boolean;
  notificationId?: string;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system' | 'custom';
  customTheme?: CustomTheme;
  defaultView: 'dashboard' | 'tasks' | 'notes' | 'bookmarks';
  notifications: {
    reminders: boolean;
    sync: boolean;
    daily: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string; // HH:mm format
    };
  };
  sync: {
    autoSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
    wifiOnly: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    locationTracking: boolean;
  };
}

export interface CustomTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  backgroundImage?: string;
}

export interface SyncStatus {
  lastSync: string;
  status: 'idle' | 'syncing' | 'error';
  pendingChanges: number;
  error?: string;
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD format
  tasks: string[]; // Task IDs
  notes: string;
  goals: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  completions: HabitCompletion[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  date: string; // YYYY-MM-DD format
  count: number;
  notes?: string;
  createdAt: string;
}

// AI-related types (TODO - for future implementation)
export interface AIAnalysis {
  summary?: string;
  tags?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  keyPoints?: string[];
  actionItems?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface AICapabilities {
  taskParsing: boolean;
  contentSummarization: boolean;
  smartTagging: boolean;
  reminderSuggestions: boolean;
  productivityInsights: boolean;
}

export interface ProductivityInsight {
  id: string;
  type: 'completion_rate' | 'time_patterns' | 'priority_distribution' | 'streak_analysis';
  title: string;
  description: string;
  data: any;
  suggestions: string[];
  createdAt: string;
}

// Navigation types
export type RootStackParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Notes: undefined;
  Bookmarks: undefined;
  Settings: undefined;
  TaskDetail: { taskId: string };
  NoteDetail: { noteId: string };
  BookmarkDetail: { bookmarkId: string };
  AddTask: undefined;
  AddNote: undefined;
  AddBookmark: undefined;
  Sync: undefined;
  Profile: undefined;
  Themes: undefined;
  Notifications: undefined;
  Privacy: undefined;
};

// Component props types
export interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
  onOpen: (url: string) => void;
}