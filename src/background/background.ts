/**
 * Meraki Background Script
 * Handles extension lifecycle, context menus, and message routing
 */

import { recordService } from '../services/recordService';
import { PageContext, Record } from '../types';

console.log('Meraki background script loaded');

// Extension installation and setup
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Meraki extension installed:', details.reason);
  
  // Set up context menus
  await setupContextMenus();
  
  // Set up side panel behavior
  await setupSidePanel();
  
  // Initialize storage if needed
  if (details.reason === 'install') {
    await initializeExtension();
  }
});

// Context menu setup
async function setupContextMenus(): Promise<void> {
  try {
    // Remove existing menus
    await chrome.contextMenus.removeAll();
    
    // Main Meraki menu
    chrome.contextMenus.create({
      id: 'meraki-main',
      title: 'Meraki Tools',
      contexts: ['page', 'selection', 'link', 'image']
    });
    
    // Quick capture options
    chrome.contextMenus.create({
      id: 'meraki-quick-note',
      parentId: 'meraki-main',
      title: '📝 Quick Note',
      contexts: ['page', 'selection']
    });
    
    chrome.contextMenus.create({
      id: 'meraki-bookmark',
      parentId: 'meraki-main',
      title: '🔖 Bookmark Page',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'meraki-task',
      parentId: 'meraki-main',
      title: '✅ Create Task',
      contexts: ['page', 'selection']
    });
    
    chrome.contextMenus.create({
      id: 'meraki-separator',
      parentId: 'meraki-main',
      type: 'separator',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'meraki-overlay',
      parentId: 'meraki-main',
      title: '🎯 Open Meraki Panel',
      contexts: ['page']
    });
    
  } catch (error) {
    console.error('Failed to setup context menus:', error);
  }
}

// Side panel setup
async function setupSidePanel(): Promise<void> {
  try {
    if ('sidePanel' in chrome) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (error) {
    console.error('Failed to setup side panel:', error);
  }
}

// Extension initialization
async function initializeExtension(): Promise<void> {
  try {
    // Set default preferences
    await chrome.storage.local.set({
      'meraki_preferences': {
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
        }
      }
    });
    
    console.log('Meraki extension initialized');
  } catch (error) {
    console.error('Failed to initialize extension:', error);
  }
}

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  
  try {
    switch (info.menuItemId) {
      case 'meraki-overlay':
        await chrome.tabs.sendMessage(tab.id, { action: 'showOverlay' });
        break;
        
      case 'meraki-quick-note':
        await handleQuickNote(info, tab);
        break;
        
      case 'meraki-bookmark':
        await handleQuickBookmark(tab);
        break;
        
      case 'meraki-task':
        await handleQuickTask(info, tab);
        break;
    }
  } catch (error) {
    console.error('Context menu action failed:', error);
  }
});

// Action button click handler
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  
  try {
    // Try to open side panel first
    if ('sidePanel' in chrome) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } else {
      // Fallback to overlay
      await chrome.tabs.sendMessage(tab.id, { action: 'showOverlay' });
    }
  } catch (error) {
    console.error('Failed to open Meraki panel:', error);
  }
});

// Message handling
chrome.runtime.onMessage.addListener((
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
): boolean => {
  
  switch (request.action) {
    case 'saveRecord':
      handleSaveRecord(request.data)
        .then(record => sendResponse({ success: true, record }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'getRecords':
      handleGetRecords(request.filters)
        .then(records => sendResponse({ success: true, records }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'updateRecord':
      handleUpdateRecord(request.id, request.updates)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'deleteRecord':
      handleDeleteRecord(request.id)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'pageLoaded':
      handlePageLoaded(request.context, sender.tab)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    // TODO: AI-related message handlers
    case 'summarizePage':
      // TODO: Implement AI summarization
      sendResponse({ success: false, error: 'AI features not yet implemented' });
      return true;
      
    case 'generateTags':
      // TODO: Implement AI tag generation
      sendResponse({ success: false, error: 'AI features not yet implemented' });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
      return true;
  }
});

// Record management handlers
async function handleSaveRecord(data: any): Promise<Record> {
  const { type, title, content, tags, context } = data;
  
  if (!context) {
    throw new Error('Page context is required');
  }
  
  return await recordService.createFromPageContext(
    context as PageContext,
    type,
    content
  );
}

async function handleGetRecords(filters?: any): Promise<Record[]> {
  if (filters?.type) {
    switch (filters.type) {
      case 'task':
        return await recordService.getTasks();
      case 'note':
        return await recordService.getNotes();
      case 'bookmark':
        return await recordService.getBookmarks();
    }
  }
  
  if (filters?.source) {
    return await recordService.getRecordsBySource(filters.source);
  }
  
  if (filters?.url) {
    return await recordService.getRecordsByUrl(filters.url);
  }
  
  return await recordService.getRecords();
}

async function handleUpdateRecord(id: string, updates: Partial<Record>): Promise<void> {
  await recordService.updateRecord(id, updates);
}

async function handleDeleteRecord(id: string): Promise<void> {
  await recordService.deleteRecord(id);
}

async function handlePageLoaded(context: PageContext, tab?: chrome.tabs.Tab): Promise<void> {
  // Store current page context for potential auto-capture
  if (tab?.id) {
    // TODO: Implement auto-capture logic based on user preferences
    console.log('Page loaded:', context.domain, context.title);
  }
}

// Quick action handlers
async function handleQuickNote(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): Promise<void> {
  const selectedText = info.selectionText || '';
  const context = await getPageContext(tab.id!);
  
  if (context) {
    await recordService.createFromPageContext(
      context,
      'note',
      selectedText || `Quick note from ${context.title}`
    );
    
    // Show notification
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon16.png',
      title: 'Meraki',
      message: 'Quick note saved!'
    });
  }
}

async function handleQuickBookmark(tab: chrome.tabs.Tab): Promise<void> {
  const context = await getPageContext(tab.id!);
  
  if (context) {
    await recordService.createFromPageContext(
      context,
      'bookmark',
      `Bookmarked from ${context.domain}`
    );
    
    // Show notification
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon16.png',
      title: 'Meraki',
      message: 'Page bookmarked!'
    });
  }
}

async function handleQuickTask(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): Promise<void> {
  const selectedText = info.selectionText || '';
  const context = await getPageContext(tab.id!);
  
  if (context) {
    const taskContent = selectedText || `Review: ${context.title}`;
    await recordService.createFromPageContext(
      context,
      'task',
      taskContent
    );
    
    // Show notification
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon16.png',
      title: 'Meraki',
      message: 'Task created!'
    });
  }
}

// Helper function to get page context
async function getPageContext(tabId: number): Promise<PageContext | null> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getPageContext' });
    return response?.context || null;
  } catch (error) {
    console.error('Failed to get page context:', error);
    return null;
  }
}

// Periodic cleanup and maintenance
chrome.alarms.create('meraki-maintenance', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'meraki-maintenance') {
    // TODO: Implement periodic maintenance tasks
    // - Clean up old records
    // - Sync with Firebase
    // - Update AI models
    console.log('Running Meraki maintenance tasks');
  }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Meraki update available:', details.version);
  // TODO: Handle graceful updates
});

// Error handling
chrome.runtime.onSuspend.addListener(() => {
  console.log('Meraki background script suspending');
  // TODO: Clean up resources
});