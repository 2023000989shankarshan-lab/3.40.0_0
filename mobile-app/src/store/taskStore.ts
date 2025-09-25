import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncAt: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  syncTasks: () => Promise<void>;
  
  // Filters and search
  getTasksByStatus: (status: 'pending' | 'completed') => Task[];
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => Task[];
  searchTasks: (query: string) => Task[];
}

export const taskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      syncStatus: 'idle',
      lastSyncAt: null,

      loadTasks: async () => {
        set({ loading: true, error: null });
        try {
          // Load tasks from local storage (already handled by persist middleware)
          // TODO: Implement Firebase sync when available
          set({ loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to load tasks' 
          });
        }
      },

      addTask: async (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
          sourceDevice: taskData.sourceDevice || 'mobile'
        };

        set(state => ({
          tasks: [...state.tasks, newTask]
        }));

        // TODO: Queue for Firebase sync
        console.log('Task added:', newTask.title);
      },

      updateTask: async (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  syncStatus: 'pending'
                }
              : task
          )
        }));

        // TODO: Queue for Firebase sync
        console.log('Task updated:', id);
      },

      deleteTask: async (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));

        // TODO: Queue for Firebase sync
        console.log('Task deleted:', id);
      },

      toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          await get().updateTask(id, { completed: !task.completed });
        }
      },

      syncTasks: async () => {
        set({ syncStatus: 'syncing' });
        try {
          // TODO: Implement Firebase sync
          // 1. Push local changes to Firebase
          // 2. Pull remote changes from Firebase
          // 3. Resolve conflicts
          // 4. Update local state
          
          console.log('Syncing tasks with Firebase...');
          
          // Simulate sync delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            syncStatus: 'idle',
            lastSyncAt: new Date().toISOString()
          });
          
          console.log('Tasks synced successfully');
        } catch (error) {
          set({ 
            syncStatus: 'error',
            error: error instanceof Error ? error.message : 'Sync failed'
          });
          console.error('Task sync failed:', error);
        }
      },

      // Helper methods
      getTasksByStatus: (status) => {
        const tasks = get().tasks;
        return status === 'completed' 
          ? tasks.filter(task => task.completed)
          : tasks.filter(task => !task.completed);
      },

      getTasksByPriority: (priority) => {
        return get().tasks.filter(task => task.priority === priority);
      },

      searchTasks: (query) => {
        const tasks = get().tasks;
        const lowercaseQuery = query.toLowerCase();
        return tasks.filter(task =>
          task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description?.toLowerCase().includes(lowercaseQuery) ||
          task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      }
    }),
    {
      name: 'meraki-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        lastSyncAt: state.lastSyncAt
      })
    }
  )
);