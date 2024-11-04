"use client";
import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
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