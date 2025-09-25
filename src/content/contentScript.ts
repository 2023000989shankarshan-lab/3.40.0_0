/**
 * Meraki Content Script
 * Handles page interaction, content extraction, and overlay injection
 */

import { PageContext } from '../types';

// Global state
let overlayVisible = false;
let currentPageContext: PageContext | null = null;

// Initialize content script
console.log('Meraki content script loaded on:', window.location.href);

// Listen for messages from background script and extension
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Content script received message:', request.action);
  
  switch (request.action) {
    case 'getPageContent':
      try {
        const content = extractPageContent();
        sendResponse({ content });
      } catch (error) {
        console.error('Failed to extract content:', error);
        sendResponse({ content: 'Failed to extract content from this page.' });
      }
      break;
      
    case 'showOverlay':
      try {
        showMerakiOverlay();
        sendResponse({ success: true });
      } catch (error) {
        console.error('Failed to show overlay:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;
      
    case 'hideOverlay':
      try {
        hideMerakiOverlay();
        sendResponse({ success: true });
      } catch (error) {
        console.error('Failed to hide overlay:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;
      
    case 'getPageContext':
      try {
        const context = getPageContext();
        sendResponse({ context });
      } catch (error) {
        console.error('Failed to get page context:', error);
        sendResponse({ context: null, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;

    case 'getCurrentTimestamp':
      try {
        const timestamp = getCurrentVideoTimestamp();
        sendResponse({ timestamp });
      } catch (error) {
        console.error('Failed to get video timestamp:', error);
        sendResponse({ timestamp: null, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;
      
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
  
  return true;
});

/**
 * Extract meaningful content from the current page
 */
function extractPageContent(): string {
  try {
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.sidebar', '.menu', '.comments'
    ];
    
    const contentCopy = document.cloneNode(true) as Document;
    unwantedSelectors.forEach(selector => {
      contentCopy.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Try to find main content
    let content = '';
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '#main-content',
      '.video-description', // YouTube
      '.product-description' // Shopping sites
    ];
    
    for (const selector of contentSelectors) {
      const element = contentCopy.querySelector(selector);
      if (element) {
        content = element.textContent || (element as HTMLElement).innerText || '';
        break;
      }
    }
    
    // Fallback to body content
    if (!content) {
      content = contentCopy.body?.textContent || contentCopy.body?.innerText || '';
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
    
    // Limit content length
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }
    
    return content || 'No readable content found on this page.';
  } catch (error) {
    console.error('Failed to extract page content:', error);
    return 'Failed to extract content from this page.';
  }
}

/**
 * Get comprehensive context information about the current page
 */
function getPageContext(): PageContext {
  const context: PageContext = {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    favicon: getFavicon(),
    timestamp: new Date().toISOString(),
    metadata: {}
  };

  // Detect page type and extract specific metadata
  if (isYouTubePage()) {
    context.metadata.isYouTube = true;
    context.metadata.videoId = extractYouTubeVideoId();
  } else if (isShoppingPage()) {
    context.metadata.isShopping = true;
    context.metadata.productInfo = extractProductInfo();
  } else if (isBookingPage()) {
    context.metadata.isBooking = true;
  }

  return context;
}

/**
 * Show the Meraki overlay panel
 */
function showMerakiOverlay(): void {
  if (overlayVisible) {
    return;
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'meraki-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 999999;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create overlay content
  const content = createOverlayContent();
  overlay.appendChild(content);

  // Add to page
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.transform = 'translateX(0)';
  });

  overlayVisible = true;
  currentPageContext = getPageContext();
}

/**
 * Hide the Meraki overlay panel
 */
function hideMerakiOverlay(): void {
  const overlay = document.getElementById('meraki-overlay');
  if (!overlay) {
    return;
  }

  overlay.style.transform = 'translateX(100%)';
  setTimeout(() => {
    overlay.remove();
    overlayVisible = false;
  }, 300);
}

/**
 * Create the overlay panel content
 */
function createOverlayContent(): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  `;
  
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Meraki</h2>
      <button id="meraki-close" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 16px;">✕</button>
    </div>
    <p style="margin: 0; font-size: 14px; opacity: 0.9;">${currentPageContext?.title || 'Capture and organize'}</p>
  `;

  // Tab navigation
  const tabs = document.createElement('div');
  tabs.style.cssText = `
    display: flex;
    background: rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  `;

  const tabButtons = [
    { id: 'notes', label: '📝 Notes', active: true },
    { id: 'bookmarks', label: '🔖 Bookmark', active: false },
    { id: 'tasks', label: '✅ Task', active: false }
  ];

  tabButtons.forEach(tab => {
    const button = document.createElement('button');
    button.id = `tab-${tab.id}`;
    button.textContent = tab.label;
    button.style.cssText = `
      flex: 1;
      padding: 12px;
      border: none;
      background: ${tab.active ? 'white' : 'transparent'};
      color: ${tab.active ? '#333' : '#666'};
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    `;
    tabs.appendChild(button);
  });

  // Content area
  const contentArea = document.createElement('div');
  contentArea.id = 'meraki-content';
  contentArea.style.cssText = `
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  `;

  // Initial content (Notes tab)
  contentArea.innerHTML = createNotesTabContent();

  // Assemble overlay
  container.appendChild(header);
  container.appendChild(tabs);
  container.appendChild(contentArea);

  // Add event listeners
  setupOverlayEventListeners(container);

  return container;
}

/**
 * Create notes tab content
 */
function createNotesTabContent(): string {
  const isYouTube = currentPageContext?.metadata?.isYouTube;
  const timestampSection = isYouTube ? `
    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #ff0000;">
      <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">📺 YouTube Note</h4>
      <button id="add-timestamp" style="background: #ff0000; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-bottom: 10px;">
        Add Current Timestamp
      </button>
      <div id="current-time" style="font-size: 12px; color: #666;"></div>
    </div>
  ` : '';

  return `
    ${timestampSection}
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Note Title</label>
      <input type="text" id="note-title" placeholder="Enter note title..." style="
        width: 100%; 
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
      " />
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Content</label>
      <textarea id="note-content" placeholder="Write your note here..." style="
        width: 100%; 
        height: 120px;
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        resize: vertical; 
        font-family: inherit;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
      "></textarea>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Tags (comma-separated)</label>
      <input type="text" id="note-tags" placeholder="web, research, important..." style="
        width: 100%; 
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
      " />
    </div>
    
    <button id="save-note" style="
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      border: none; 
      padding: 14px; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer;
      font-size: 14px;
      transition: transform 0.2s ease;
    ">Save Note</button>
  `;
}

/**
 * Setup event listeners for overlay interactions
 */
function setupOverlayEventListeners(container: HTMLElement): void {
  // Close button
  const closeBtn = container.querySelector('#meraki-close');
  closeBtn?.addEventListener('click', hideMerakiOverlay);

  // Tab switching
  const tabButtons = container.querySelectorAll('[id^="tab-"]');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tabId = target.id.replace('tab-', '');
      switchTab(tabId, container);
    });
  });

  // Save note button
  const saveBtn = container.querySelector('#save-note');
  saveBtn?.addEventListener('click', saveNote);

  // Add timestamp button (YouTube)
  const timestampBtn = container.querySelector('#add-timestamp');
  timestampBtn?.addEventListener('click', addCurrentTimestamp);

  // Update current time display for YouTube
  if (currentPageContext?.metadata?.isYouTube) {
    updateCurrentTimeDisplay();
    setInterval(updateCurrentTimeDisplay, 1000);
  }

  // Focus management
  const titleInput = container.querySelector('#note-title') as HTMLInputElement;
  titleInput?.focus();
}

/**
 * Switch between overlay tabs
 */
function switchTab(tabId: string, container: HTMLElement): void {
  // Update tab buttons
  const tabButtons = container.querySelectorAll('[id^="tab-"]');
  tabButtons.forEach(button => {
    const isActive = button.id === `tab-${tabId}`;
    (button as HTMLElement).style.background = isActive ? 'white' : 'transparent';
    (button as HTMLElement).style.color = isActive ? '#333' : '#666';
  });

  // Update content
  const contentArea = container.querySelector('#meraki-content');
  if (!contentArea) return;

  switch (tabId) {
    case 'notes':
      contentArea.innerHTML = createNotesTabContent();
      setupOverlayEventListeners(container);
      break;
    case 'bookmarks':
      contentArea.innerHTML = createBookmarkTabContent();
      break;
    case 'tasks':
      contentArea.innerHTML = createTaskTabContent();
      break;
  }
}

/**
 * Create bookmark tab content
 */
function createBookmarkTabContent(): string {
  return `
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Bookmark Title</label>
      <input type="text" id="bookmark-title" value="${currentPageContext?.title || ''}" style="
        width: 100%; 
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        font-size: 14px;
        outline: none;
      " />
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Description</label>
      <textarea id="bookmark-description" placeholder="Why is this page important?" style="
        width: 100%; 
        height: 80px;
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        resize: vertical; 
        font-family: inherit;
        font-size: 14px;
        outline: none;
      "></textarea>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Collections</label>
      <input type="text" id="bookmark-collections" placeholder="work, research, inspiration..." style="
        width: 100%; 
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        font-size: 14px;
        outline: none;
      " />
    </div>
    
    <button id="save-bookmark" style="
      width: 100%;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white; 
      border: none; 
      padding: 14px; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer;
      font-size: 14px;
    ">Save Bookmark</button>
  `;
}

/**
 * Create task tab content
 */
function createTaskTabContent(): string {
  return `
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Task Title</label>
      <input type="text" id="task-title" placeholder="What needs to be done?" style="
        width: 100%; 
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        font-size: 14px;
        outline: none;
      " />
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Description</label>
      <textarea id="task-description" placeholder="Additional details..." style="
        width: 100%; 
        height: 80px;
        padding: 12px; 
        border: 2px solid #e1e5e9; 
        border-radius: 8px; 
        resize: vertical; 
        font-family: inherit;
        font-size: 14px;
        outline: none;
      "></textarea>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Priority</label>
        <select id="task-priority" style="
          width: 100%; 
          padding: 12px; 
          border: 2px solid #e1e5e9; 
          border-radius: 8px; 
          font-size: 14px;
          outline: none;
        ">
          <option value="low">🟢 Low</option>
          <option value="medium" selected>🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px;">Due Date</label>
        <input type="date" id="task-due-date" style="
          width: 100%; 
          padding: 12px; 
          border: 2px solid #e1e5e9; 
          border-radius: 8px; 
          font-size: 14px;
          outline: none;
        " />
      </div>
    </div>
    
    <button id="save-task" style="
      width: 100%;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white; 
      border: none; 
      padding: 14px; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer;
      font-size: 14px;
    ">Create Task</button>
  `;
}

/**
 * Save note functionality
 */
async function saveNote(): Promise<void> {
  const titleInput = document.querySelector('#note-title') as HTMLInputElement;
  const contentInput = document.querySelector('#note-content') as HTMLTextAreaElement;
  const tagsInput = document.querySelector('#note-tags') as HTMLInputElement;

  if (!titleInput || !contentInput) {
    return;
  }

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const tags = tagsInput?.value.split(',').map(tag => tag.trim()).filter(Boolean) || [];

  if (!title || !content) {
    alert('Please fill in both title and content');
    return;
  }

  try {
    // Send to background script for saving
    await chrome.runtime.sendMessage({
      action: 'saveRecord',
      data: {
        type: 'note',
        title,
        content,
        tags,
        context: currentPageContext
      }
    });

    // Show success feedback
    const saveBtn = document.querySelector('#save-note') as HTMLButtonElement;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved! ✓';
    saveBtn.style.background = '#10b981';

    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      
      // Clear form
      titleInput.value = '';
      contentInput.value = '';
      if (tagsInput) tagsInput.value = '';
    }, 2000);

  } catch (error) {
    console.error('Failed to save note:', error);
    alert('Failed to save note. Please try again.');
  }
}

/**
 * Add current video timestamp to note
 */
function addCurrentTimestamp(): void {
  const timestamp = getCurrentVideoTimestamp();
  if (timestamp === null) {
    alert('Could not get current video timestamp');
    return;
  }

  const contentInput = document.querySelector('#note-content') as HTMLTextAreaElement;
  if (!contentInput) return;

  const timestampText = `[${formatTimestamp(timestamp)}] `;
  const currentContent = contentInput.value;
  const cursorPosition = contentInput.selectionStart;

  const newContent = 
    currentContent.slice(0, cursorPosition) + 
    timestampText + 
    currentContent.slice(cursorPosition);

  contentInput.value = newContent;
  contentInput.focus();
  contentInput.setSelectionRange(
    cursorPosition + timestampText.length, 
    cursorPosition + timestampText.length
  );
}

/**
 * Update current time display for YouTube videos
 */
function updateCurrentTimeDisplay(): void {
  const timeDisplay = document.querySelector('#current-time');
  if (!timeDisplay) return;

  const timestamp = getCurrentVideoTimestamp();
  if (timestamp !== null) {
    timeDisplay.textContent = `Current time: ${formatTimestamp(timestamp)}`;
  }
}

/**
 * Get current video timestamp (YouTube)
 */
function getCurrentVideoTimestamp(): number | null {
  try {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video && !video.paused) {
      return Math.floor(video.currentTime);
    }
    return null;
  } catch (error) {
    console.error('Failed to get video timestamp:', error);
    return null;
  }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Helper functions for page detection
function isYouTubePage(): boolean {
  return window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be');
}

function isShoppingPage(): boolean {
  const domain = window.location.hostname.toLowerCase();
  return domain.includes('amazon.') || domain.includes('ebay.') || 
         domain.includes('shop') || domain.includes('store') ||
         domain.includes('etsy.') || domain.includes('walmart.');
}

function isBookingPage(): boolean {
  const domain = window.location.hostname.toLowerCase();
  return domain.includes('booking.') || domain.includes('hotel') || 
         domain.includes('airbnb.') || domain.includes('expedia.') ||
         domain.includes('kayak.') || domain.includes('priceline.');
}

function extractYouTubeVideoId(): string | undefined {
  const url = window.location.href;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : undefined;
}

function extractProductInfo(): any {
  // TODO: Implement product info extraction for shopping sites
  return {};
}

function getFavicon(): string | undefined {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement ||
                  document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
  return favicon?.href;
}

// Auto-send page context to background script
setTimeout(() => {
  chrome.runtime.sendMessage({
    action: 'pageLoaded',
    context: getPageContext()
  }).catch(error => {
    console.error('Failed to send page context:', error);
  });
}, 1000);

// Listen for extension icon clicks (toolbar integration)
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Shift + M to toggle overlay
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
    e.preventDefault();
    if (overlayVisible) {
      hideMerakiOverlay();
    } else {
      showMerakiOverlay();
    }
  }
});