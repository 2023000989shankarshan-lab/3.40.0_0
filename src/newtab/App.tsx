import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { Settings, Plus, Search, Filter } from 'lucide-react'

/**
 * Meraki New Tab Dashboard
 * Clean, focused interface for productivity and content management
 */
function App() {
  const { 
    preferences,
    tasks,
    notes,
    loadTasks,
    loadNotes,
    setShowPopup
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'notes' | 'bookmarks'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadTasks(), loadNotes()])
      } catch (error) {
        console.error('Failed to initialize dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [loadTasks, loadNotes])

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    if (hour < 21) return 'Good Evening'
    return 'Good Night'
  }

  const pendingTasks = tasks.filter(task => !task.completed)
  const recentNotes = notes.slice(0, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-gray-600 text-lg">Loading Meraki...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Greeting */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Meraki</h1>
              </div>
              
              <div className="hidden md:block">
                <h2 className="text-lg text-gray-600">
                  {getTimeBasedGreeting()}, {preferences.name || 'there'}!
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks, notes, bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white/60 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <motion.button
                onClick={() => setShowPopup(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', count: null },
              { id: 'tasks', label: 'Tasks', count: pendingTasks.length },
              { id: 'notes', label: 'Notes', count: notes.length },
              { id: 'bookmarks', label: 'Bookmarks', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">{pendingTasks.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📋</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Notes Saved</p>
                      <p className="text-3xl font-bold text-gray-900">{notes.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">📝</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bookmarks</p>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-xl">🔖</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Tasks */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h3>
                  {pendingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {pendingTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                          <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{task.title}</p>
                            {task.dueDate && (
                              <p className="text-sm text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pending tasks</p>
                      <button
                        onClick={() => setActiveView('tasks')}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create your first task
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Notes */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notes</h3>
                  {recentNotes.length > 0 ? (
                    <div className="space-y-3">
                      {recentNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-white/50 rounded-lg">
                          <p className="font-medium text-gray-800 mb-1">{note.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                          {note.url && (
                            <p className="text-xs text-blue-600 mt-1">{note.domain}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No notes yet</p>
                      <button
                        onClick={() => setActiveView('notes')}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create your first note
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights Placeholder */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 border border-purple-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                </div>
                <p className="text-gray-600">
                  AI-powered productivity insights, content summarization, and smart suggestions will be available here once AI integration is complete.
                </p>
              </div>
            </motion.div>
          )}

          {activeView === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Management</h2>
              <p className="text-gray-600 mb-8">Comprehensive task management interface coming soon</p>
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500">Use the extension overlay to create tasks for now</p>
            </motion.div>
          )}

          {activeView === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Notes Management</h2>
              <p className="text-gray-600 mb-8">Advanced notes interface coming soon</p>
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500">Use the extension overlay to create notes for now</p>
            </motion.div>
          )}

          {activeView === 'bookmarks' && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bookmarks</h2>
              <p className="text-gray-600 mb-8">Smart bookmarking interface coming soon</p>
              <div className="text-6xl mb-4">🔖</div>
              <p className="text-gray-500">Use the extension overlay to bookmark pages for now</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App