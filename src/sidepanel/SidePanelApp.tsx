import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  FileText, 
  Loader2, 
  Send, 
  Sparkles, 
  PenTool, 
  Bookmark,
  CheckSquare,
  Settings
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { recordService } from '../services/recordService';
import { aiService } from '../services/aiService';

function SidePanelApp() {
  const { records, loadRecords } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'capture' | 'records' | 'ai' | 'settings'>('capture');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPageContext, setCurrentPageContext] = useState<any>(null);
  
  // Capture form state
  const [captureType, setCaptureType] = useState<'note' | 'bookmark' | 'task'>('note');
  const [captureTitle, setCaptureTitle] = useState('');
  const [captureContent, setCaptureContent] = useState('');
  const [captureTags, setCaptureTags] = useState('');

  // AI chat state
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadRecords();
    getCurrentPageContext();
  }, [loadRecords]);

  const getCurrentPageContext = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContext' });
        setCurrentPageContext(response?.context);
        
        // Auto-fill title from page
        if (response?.context?.title && !captureTitle) {
          setCaptureTitle(response.context.title);
        }
      }
    } catch (error) {
      console.error('Failed to get page context:', error);
    }
  };

  const handleCapture = async () => {
    if (!captureTitle.trim() || !captureContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsLoading(true);
    try {
      await recordService.createFromPageContext(
        currentPageContext,
        captureType,
        captureContent
      );

      // Reset form
      setCaptureTitle('');
      setCaptureContent('');
      setCaptureTags('');
      
      // Reload records
      await loadRecords();
      
      // Show success
      alert(`${captureType.charAt(0).toUpperCase() + captureType.slice(1)} saved successfully!`);
    } catch (error) {
      console.error('Failed to capture:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIChat = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user' as const, content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await aiService.summarizeContent(aiInput);
      const assistantMessage = { role: 'assistant' as const, content: response.text };
      setAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat failed:', error);
      const errorMessage = { role: 'assistant' as const, content: 'Sorry, AI features are not yet implemented. This is a placeholder.' };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarizePage = async () => {
    if (!currentPageContext) return;

    setAiLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
        if (response?.content) {
          const summary = await aiService.summarizeContent(response.content);
          const summaryMessage = { 
            role: 'assistant' as const, 
            content: `Page Summary:\n\n${summary.text}` 
          };
          setAiMessages(prev => [...prev, summaryMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to summarize page:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const recentRecords = records.slice(0, 10);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <h1 className="font-semibold text-gray-800">Meraki</h1>
        </div>
        
        {currentPageContext && (
          <div className="text-sm">
            <p className="font-medium text-gray-800 truncate">{currentPageContext.title}</p>
            <p className="text-gray-500 truncate">{currentPageContext.domain}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex">
          {[
            { id: 'capture', label: 'Capture', icon: PenTool },
            { id: 'records', label: 'Records', icon: FileText },
            { id: 'ai', label: 'AI', icon: Sparkles },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 py-3 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full p-4 overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Capture Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex space-x-2">
                    {[
                      { id: 'note', label: 'Note', icon: '📝' },
                      { id: 'bookmark', label: 'Bookmark', icon: '🔖' },
                      { id: 'task', label: 'Task', icon: '✅' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCaptureType(type.id as any)}
                        className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${
                          captureType === type.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="block mb-1">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={captureTitle}
                    onChange={(e) => setCaptureTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={captureContent}
                    onChange={(e) => setCaptureContent(e.target.value)}
                    placeholder={`Write your ${captureType} here...`}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={6}
                  />
                </div>

                {/* Tags Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={captureTags}
                    onChange={(e) => setCaptureTags(e.target.value)}
                    placeholder="web, research, important..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Save Button */}
                <motion.button
                  onClick={handleCapture}
                  disabled={isLoading || !captureTitle.trim() || !captureContent.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    `Save ${captureType.charAt(0).toUpperCase() + captureType.slice(1)}`
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full p-4 overflow-y-auto"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Records</h2>
                
                {recentRecords.length > 0 ? (
                  <div className="space-y-3">
                    {recentRecords.map((record) => (
                      <div key={record.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
                        <div className="flex items-start space-x-3">
                          <div className="text-lg">
                            {record.type === 'note' ? '📝' : 
                             record.type === 'bookmark' ? '🔖' : '✅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 truncate">{record.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{record.content}</p>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                              <span>{record.source}</span>
                              <span>•</span>
                              <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No records yet</p>
                    <p className="text-sm text-gray-500">Start capturing content from the web</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* AI Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">AI Assistant</p>
                    <div className="space-y-2">
                      <motion.button
                        onClick={handleSummarizePage}
                        disabled={aiLoading}
                        className="w-full p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        📄 Summarize This Page
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  aiMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))
                )}
                
                {aiLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* AI Input */}
              <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                    placeholder="Ask AI about this page..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={handleAIChat}
                    disabled={aiLoading || !aiInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-center">
                  AI features are in development. Responses are placeholders.
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full p-4 overflow-y-auto"
            >
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
                  <h3 className="font-medium text-gray-800 mb-3">Extension Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="text-gray-600">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Records Stored:</span>
                      <span className="text-gray-600">{records.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Features:</span>
                      <span className="text-yellow-600">In Development</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sync Status:</span>
                      <span className="text-yellow-600">Local Only</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-medium text-amber-800 mb-2">🚧 Under Development</h3>
                  <p className="text-sm text-amber-700">
                    Meraki is actively being developed. Many features including AI integration, 
                    Firebase sync, and advanced settings are coming soon.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SidePanelApp;