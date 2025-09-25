import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { taskStore } from '../store/taskStore';
import { Task, Attachment, Reminder } from '../types';

const TasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    loadTasks,
    syncTasks
  } = taskStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'completed' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    tags: [] as string[],
    attachments: [] as Attachment[],
    reminders: [] as Reminder[]
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await addTask({
        title: newTask.title,
        description: newTask.description,
        completed: false,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        tags: newTask.tags,
        attachments: newTask.attachments,
        reminders: newTask.reminders,
        sourceDevice: 'mobile'
      });

      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
        attachments: [],
        reminders: []
      });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask(taskId)
        }
      ]
    );
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const attachment: Attachment = {
        id: Date.now().toString(),
        type: 'photo',
        uri: result.assets[0].uri,
        name: `Photo_${Date.now()}.jpg`,
        size: result.assets[0].fileSize,
        mimeType: 'image/jpeg',
        createdAt: new Date().toISOString()
      };

      setNewTask(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment]
      }));
    }
  };

  const handleAddVoiceNote = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permissions');
        return;
      }

      // TODO: Implement voice recording
      Alert.alert('Voice Notes', 'Voice note recording will be implemented soon');
    } catch (error) {
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const handleAddReminder = async () => {
    // TODO: Implement reminder creation modal
    Alert.alert('Reminders', 'Reminder creation will be implemented soon');
  };

  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(query) &&
          !task.description?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Apply status filter
    switch (filterBy) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'today':
        if (!task.dueDate) return false;
        const today = new Date().toDateString();
        const taskDate = new Date(task.dueDate).toDateString();
        return taskDate === today;
      default:
        return true;
    }
  });

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
          onPress={() => handleToggleTask(task.id)}
        >
          {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
            {task.title}
          </Text>
          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}
          
          {/* Task metadata */}
          <View style={styles.taskMeta}>
            {task.dueDate && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.metaText}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {task.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {task.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {task.tags.length > 2 && (
                  <Text style={styles.moreTagsText}>+{task.tags.length - 2}</Text>
                )}
              </View>
            )}
          </View>
          
          {/* Attachments preview */}
          {task.attachments.length > 0 && (
            <View style={styles.attachmentsPreview}>
              {task.attachments.slice(0, 3).map((attachment, index) => (
                <View key={attachment.id} style={styles.attachmentIcon}>
                  <Ionicons 
                    name={attachment.type === 'photo' ? 'image' : 'document'} 
                    size={16} 
                    color="#667eea" 
                  />
                </View>
              ))}
              {task.attachments.length > 3 && (
                <Text style={styles.moreAttachmentsText}>+{task.attachments.length - 3}</Text>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.taskActions}>
          <View style={[styles.priorityIndicator, styles[`priority${task.priority}`]]} />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setEditingTask(task)}
          >
            <Ionicons name="pencil" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTask(task.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => syncTasks()}
          >
            <Ionicons name="sync" size={20} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        {['all', 'pending', 'completed', 'today'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, filterBy === filter && styles.filterButtonActive]}
            onPress={() => setFilterBy(filter as any)}
          >
            <Text style={[styles.filterText, filterBy === filter && styles.filterTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No tasks found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={handleAddTask}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Task Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="What needs to be done?"
                value={newTask.title}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
                autoFocus
              />
            </View>

            {/* Task Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Add more details..."
                value={newTask.description}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Priority and Due Date */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.formLabel}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {['low', 'medium', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        newTask.priority === priority && styles.priorityButtonActive
                      ]}
                      onPress={() => setNewTask(prev => ({ ...prev, priority: priority as any }))}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        newTask.priority === priority && styles.priorityButtonTextActive
                      ]}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.formLabel}>Due Date</Text>
                <TouchableOpacity style={styles.dateButton}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.dateButtonText}>
                    {newTask.dueDate ? new Date(newTask.dueDate).toLocaleDateString() : 'Set date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Attachments */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Attachments</Text>
              <View style={styles.attachmentButtons}>
                <TouchableOpacity style={styles.attachmentButton} onPress={handleAddPhoto}>
                  <Ionicons name="camera" size={20} color="#667eea" />
                  <Text style={styles.attachmentButtonText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentButton} onPress={handleAddVoiceNote}>
                  <Ionicons name="mic" size={20} color="#667eea" />
                  <Text style={styles.attachmentButtonText}>Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentButton} onPress={handleAddReminder}>
                  <Ionicons name="notifications" size={20} color="#667eea" />
                  <Text style={styles.attachmentButtonText}>Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Show attachments if any */}
            {newTask.attachments.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Added Attachments</Text>
                {newTask.attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <Ionicons 
                      name={attachment.type === 'photo' ? 'image' : 'document'} 
                      size={16} 
                      color="#667eea" 
                    />
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <TouchableOpacity
                      onPress={() => setNewTask(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter(a => a.id !== attachment.id)
                      }))}
                    >
                      <Ionicons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'white',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    color: '#4338ca',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#666',
  },
  attachmentsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  attachmentIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#f0f2ff',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAttachmentsText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  taskActions: {
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  prioritylow: {
    backgroundColor: '#10b981',
  },
  prioritymedium: {
    backgroundColor: '#f59e0b',
  },
  priorityhigh: {
    backgroundColor: '#ef4444',
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666',
  },
  priorityButtonTextActive: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#666',
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    gap: 6,
  },
  attachmentButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 8,
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
});

export default TasksScreen;