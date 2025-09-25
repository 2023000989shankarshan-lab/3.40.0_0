import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { Record, Task, Note, UserPreferences } from '../types';
import { recordService } from '../services/recordService';
import { authService } from '../services/authService';

interface AppState {
  // Authentication state
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Authentication actions
  initializeAuth: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // User preferences
  preferences: UserPreferences;
  
  // Records (tasks, notes, bookmarks)
  records: Record[];
  tasksLoading: boolean;
  notesLoading: boolean;
  
  // UI state
  showPopup: boolean;
  currentPageContext: {
    url: string;
    title: string;
    domain: string;
  } | null;
  
  // Actions
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Record actions
  loadRecords: () => Promise<void>;
  loadTasks: () => Promise<void>;
  loadNotes: () => Promise<void>;
  
  // Computed getters
  tasks: Task[];
  notes: Note[];
  bookmarks: Record[];
  
  // UI actions
  setShowPopup: (show: boolean) => void;
  setPageContext: (context: { url: string; title: string; domain: string }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      // Auth state
      user: null,
      isAuthenticated: false,
      authLoading: true,

      // Auth actions
      initializeAuth: () => {
        authService.onAuthStateChange((user) => {
          set({ 
            user, 
            isAuthenticated: !!user,
            authLoading: false
          });
        });
      },

      signIn: async (email: string, password: string) => {
        set({ authLoading: true });
        try {
          const user = await authService.signIn(email, password);
          set({ 
            user,
            isAuthenticated: true,
            authLoading: false
          });
        } catch (error) {
          set({ authLoading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string) => {
        set({ authLoading: true });
        try {
          const user = await authService.signUp(email, password);
          set({ 
            user,
            isAuthenticated: true,
            authLoading: false
          });
        } catch (error) {
          set({ authLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ authLoading: true });
        try {
          await authService.signOut();
          set({ 
            user: null,
            isAuthenticated: false,
            authLoading: false
          });
        } catch (error) {
          set({ authLoading: false });
          throw error;
        }
      },

      // User preferences
      preferences: {
        theme: 'system',
        defaultView: 'dashboard',
        autoCapture: {
          youtube: true,
          shopping: true,
          booking: true
        },
        notifications: {
          reminders: true,
          sync: true,
          daily: false
        },
        privacy: {
          analytics: false,
          crashReports: true
        }
      },
      records: [],
      tasksLoading: false,
      notesLoading: false,
      showPopup: false,
      currentPageContext: null,

      // Preferences
      setPreferences: (newPreferences) => {
        const updatedPreferences = { ...get().preferences, ...newPreferences };
        set({ preferences: updatedPreferences });
        // TODO: Save to storage service
      },

      // Record management
      loadRecords: async () => {
        try {
          const records = await recordService.getRecords();
          set({ records });
        } catch (error) {
          console.error('Failed to load records:', error);
        }
      },

      loadTasks: async () => {
        set({ tasksLoading: true });
        try {
          const records = await recordService.getRecords();
          set({ records, tasksLoading: false });
        } catch (error) {
          console.error('Failed to load tasks:', error);
          set({ tasksLoading: false });
        }
      },

      loadNotes: async () => {
        set({ notesLoading: true });
        try {
          const records = await recordService.getRecords();
          set({ records, notesLoading: false });
        } catch (error) {
          console.error('Failed to load notes:', error);
          set({ notesLoading: false });
        }
      },

      // Computed getters
      get tasks() {
        return get().records.filter(record => record.type === 'task') as Task[];
      },
      
      get notes() {
        return get().records.filter(record => record.type === 'note') as Note[];
      },
      
      get bookmarks() {
        return get().records.filter(record => record.type === 'bookmark');
      },

      // UI actions
      setShowPopup: (show) => set({ showPopup: show }),
      setPageContext: (context) => set({ currentPageContext: context })
    }),
    {
      name: 'meraki-app-store',
      partialize: (state) => ({
        preferences: state.preferences,
        records: state.records
      })
    }
  )
);