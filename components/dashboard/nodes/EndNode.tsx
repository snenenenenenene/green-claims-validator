// components/dashboard/nodes/EndNode.tsx
import React, { useState, useEffect, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Square, ArrowRight, CheckCircle2, Ban } from 'lucide-react';
import { EndNodeData } from '@/types/nodes';
import BaseNode from './BaseNode';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface EndNodeProps extends NodeProps<EndNodeData> {
  selected: boolean;
}

const EndNode = ({ id, data, selected }: EndNodeProps) => {
  const { chartStore } = useStores();
  const chartInstances = chartStore.chartInstances;
  const otherInstances = chartInstances.filter(
    instance => instance.id !== data.instanceId
  );

  // Local state
  const [label, setLabel] = useState(data.label || 'End Node');
  const [endType, setEndType] = useState<'end' | 'redirect'>(data.endType || 'end');
  const [redirectTab, setRedirectTab] = useState(data.redirectTab || '');

  // Sync local state back to data
  useEffect(() => {
    data.label = label;
    data.endType = endType;
    data.redirectTab = redirectTab;
  }, [label, endType, redirectTab, data]);

  return (
    <BaseNode
      title={endType === 'redirect' ? 'Redirect Flow' : 'End Flow'}
      onDelete={() => chartStore.removeNode(data.instanceId, id)}
      selected={selected}
      handles={false}
      headerClassName={cn(
        "transition-colors duration-200",
        endType === 'redirect' ? "bg-blue-50" : "bg-red-50"
      )}
    >
      <div className="px-3 py-4">
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            "w-3 h-3 border-2 border-white transition-all duration-200",
            endType === 'redirect'
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-red-500 hover:bg-red-600",
            "hover:scale-110"
          )}
        />

        <div className="space-y-4">
          {/* Label Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Node"
            />
          </div>

          {/* End Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            {/* End Flow Button */}
            <motion.button
              onClick={() => setEndType('end')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200",
                endType === 'end'
                  ? "bg-red-50 border-2 border-red-200 shadow-sm"
                  : "border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <Square className={cn(
                "h-6 w-6 transition-colors",
                endType === 'end' ? "text-red-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm font-medium transition-colors",
                endType === 'end' ? "text-red-700" : "text-gray-600"
              )}>
                End Flow
              </span>
              {endType === 'end' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                </motion.div>
              )}
            </motion.button>

            {/* Redirect Button */}
            <motion.button
              onClick={() => setEndType('redirect')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200",
                endType === 'redirect'
                  ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                  : "border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <ArrowRight className={cn(
                "h-6 w-6 transition-colors",
                endType === 'redirect' ? "text-blue-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm font-medium transition-colors",
                endType === 'redirect' ? "text-blue-700" : "text-gray-600"
              )}>
                Redirect
              </span>
              {endType === 'redirect' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </motion.div>
              )}
            </motion.button>
          </div>

          {/* Redirect Selection */}
          <AnimatePresence mode="wait">
            {endType === 'redirect' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Redirect To
                  </label>
                  {otherInstances.length > 0 ? (
                    <select
                      value={redirectTab}
                      onChange={(e) => setRedirectTab(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg transition-all duration-200",
                        "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
                        !redirectTab && "text-gray-500"
                      )}
                    >
                      <option value="" disabled>
                        Select a flow...
                      </option>
                      {otherInstances.map(instance => (
                        <option key={instance.name} value={instance.name}>
                          {instance.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                      <Ban className="h-4 w-4" />
                      <span>No other flows available</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BaseNode>
  );
};

EndNode.displayName = 'EndNode';

export default memo(EndNode);