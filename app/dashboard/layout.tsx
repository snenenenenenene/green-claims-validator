"use client";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, GitCommit, Save, Search } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTemplates = [
  {
    id: 'startNode',
    label: 'Start Node',
    description: 'Begins the flow',
    icon: '▶️',
    category: 'basic'
  },
  {
    id: 'endNode',
    label: 'End Node',
    description: 'Ends the flow',
    icon: '⏹️',
    category: 'basic'
  },
  {
    id: 'yesNo',
    label: 'Yes/No Question',
    description: 'Binary choice question',
    icon: '❓',
    category: 'question'
  },
  {
    id: 'singleChoice',
    label: 'Single Choice',
    description: 'One option from many',
    icon: '☝️',
    category: 'question'
  },
  {
    id: 'multipleChoice',
    label: 'Multiple Choice',
    description: 'Multiple selections allowed',
    icon: '✨',
    category: 'question'
  },
  {
    id: 'weightNode',
    label: 'Weight Node',
    description: 'Adjusts scoring weight',
    icon: '⚖️',
    category: 'logic'
  },
  {
    id: 'functionNode',
    label: 'Function Node',
    description: 'Custom logic and calculations',
    icon: '🔧',
    category: 'logic'
  },
];

const categories = [
  { id: 'all', label: 'All Nodes' },
  { id: 'basic', label: 'Basic' },
  { id: 'question', label: 'Questions' },
  { id: 'logic', label: 'Logic' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTemplates.filter(node =>
    (activeCategory === 'all' || node.category === activeCategory) &&
    (node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ReactFlowProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-screen border-r border-gray-200 bg-white flex flex-col overflow-hidden relative"
            >
              {/* Search Bar */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="border-b border-gray-200 p-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        activeCategory === category.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      aria-pressed={activeCategory === category.id}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Node List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
                {filteredNodes.map((node) => (
                  <motion.div
                    key={node.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    className="group cursor-move rounded-lg border border-gray-200 bg-white p-2.5 hover:border-blue-500 hover:shadow-sm transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span role="img" aria-label={node.label} className="text-xl">
                        {node.icon}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{node.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{node.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Resize Handle */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors"
                onMouseDown={(e) => {
                  const startX = e.pageX;
                  const startWidth = sidebarWidth;

                  const onMouseMove = (e: MouseEvent) => {
                    const newWidth = startWidth + (e.pageX - startX);
                    if (newWidth >= 200 && newWidth <= 400) {
                      setSidebarWidth(newWidth);
                    }
                  };

                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };

                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              />

              {/* Keyboard Shortcuts or Help */}
              <div className="border-t border-gray-200 p-3">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Drag</kbd>
                    <span>to add nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">⌘ S</kbd>
                    <span>to save</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute left-0 top-4 z-50 p-1.5 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-50"
            aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Main Content */}
          <main className="flex-1 relative bg-gray-50 pb-16">
            {children}
          </main>

          {/* Footer with Save/Commit Controls */}
          <DashboardFooter />
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </ReactFlowProvider>
  );
}

function DashboardFooter() {
  const { chartStore, commitStore, utilityStore } = useStores();
  const [isExpanded, setIsExpanded] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitType, setCommitType] = useState<'local' | 'global'>('local');
  const [isSaving, setIsSaving] = useState(false);

  const handleCommitAndSave = async () => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message');
      return;
    }

    setIsSaving(true);
    try {
      // Add commit
      if (commitType === 'local') {
        commitStore.addLocalCommit(commitMessage);
      } else {
        commitStore.addGlobalCommit(commitMessage);
      }

      // Save to DB
      await utilityStore.saveToDb(chartStore.chartInstances);

      toast.success('Changes saved successfully');
      setCommitMessage('');
      setIsExpanded(false);
    } catch (error) {
      toast.error('Failed to save changes');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSave = async () => {
    setIsSaving(true);
    try {
      await utilityStore.saveToDb(chartStore.chartInstances);
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Expanded Commit Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="container mx-auto max-w-3xl p-4 space-y-4">
              {/* Commit Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Commit Type Selection */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCommitType('local')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${commitType === 'local'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Local Commit
                </button>
                <button
                  onClick={() => setCommitType('global')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${commitType === 'global'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Global Commit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto max-w-3xl p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Toggle Expand Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label={isExpanded ? "Collapse commit panel" : "Expand commit panel"}
              >
                <ChevronUp
                  className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Quick Save Button */}
              <button
                onClick={handleQuickSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {isSaving ? (
                  <LoadingSpinner />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Quick Save
              </button>
            </div>

            {/* Commit and Save Button */}
            <button
              onClick={handleCommitAndSave}
              disabled={isSaving || !commitMessage.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <LoadingSpinner />
              ) : (
                <GitCommit className="h-4 w-4" />
              )}
              Commit & Save
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}