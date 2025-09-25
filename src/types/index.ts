// Core data types for Meraki system

export interface Record {
  id: string;
  type: 'note' | 'bookmark' | 'task';
  source: 'youtube' | 'shopping' | 'booking' | 'generic';
  url: string;
  title: string;
  metadata: RecordMetadata;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface RecordMetadata {
  favicon?: string;
  timestamp?: number; // For YouTube videos
  price?: string; // For shopping sites
  tags?: string[];
  domain?: string;
  videoId?: string; // For YouTube
  duration?: number; // For YouTube
  channel?: string; // For YouTube
  productId?: string; // For shopping
  rating?: number; // For products/hotels
}

export interface Task extends Record {
  type: 'task';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  reminders?: Reminder[];
  subtasks?: SubTask[];
  attachments?: Attachment[];
}

export interface Note extends Record {
  type: 'note';
  timestampNotes?: TimestampNote[]; // For YouTube videos
}

export interface Bookmark extends Record {
  type: 'bookmark';
  collections?: string[]; // Bookmark collections/folders
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TimestampNote {
  id: string;
  timestamp: number; // Seconds into video
  content: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: 'time' | 'location';
  value: string; // ISO date for time, coordinates for location
  message?: string;
  enabled: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'link' | 'file';
  url: string;
  name: string;
  size?: number;
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
  theme: 'light' | 'dark' | 'system';
  defaultView: 'dashboard' | 'tasks' | 'notes' | 'bookmarks';
  autoCapture: {
    youtube: boolean;
    shopping: boolean;
    booking: boolean;
  };
  notifications: {
    reminders: boolean;
    sync: boolean;
    daily: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
  };
}

export interface PageContext {
  url: string;
  title: string;
  domain: string;
  favicon?: string;
  timestamp: string;
  metadata?: {
    isYouTube?: boolean;
    isShopping?: boolean;
    isBooking?: boolean;
    videoId?: string;
    productInfo?: any;
  };
}

export interface SyncStatus {
  lastSync: string;
  status: 'idle' | 'syncing' | 'error';
  pendingChanges: number;
  error?: string;
}

// AI-related types (TODO - for future implementation)
export interface AIAnalysis {
  summary?: string;
  tags?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  keyPoints?: string[];
  actionItems?: string[];
}

export interface AICapabilities {
  summarization: boolean;
  tagging: boolean;
  taskExtraction: boolean;
  smartReminders: boolean;
}