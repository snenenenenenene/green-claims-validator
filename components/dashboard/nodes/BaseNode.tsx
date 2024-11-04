// components/dashboard/nodes/BaseNode.tsx
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BaseNodeProps extends NodeProps {
  title?: string;
  showDelete?: boolean;
  onDelete?: () => void;
  headerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  handles?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export default function BaseNode({
  title,
  showDelete = true,
  onDelete,
  headerClassName,
  contentClassName,
  children,
  handles = { top: true, bottom: true },
  selected,
  ...props
}: BaseNodeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "group min-w-[200px] bg-white rounded-xl border transition-all duration-200",
        selected ? "border-blue-500 shadow-lg" : "border-gray-200 shadow-sm",
        "hover:shadow-md"
      )}
    >
      {/* Node Handles */}
      {handles.top && (
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-white top-0 -translate-y-1/2",
            "transition-all duration-200",
            "hover:bg-blue-600 hover:scale-110"
          )}
        />
      )}
      {handles.right && (
        <Handle
          type="source"
          position={Position.Right}
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-white right-0 translate-x-1/2",
            "transition-all duration-200",
            "hover:bg-blue-600 hover:scale-110"
          )}
        />
      )}
      {handles.bottom && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-white bottom-0 translate-y-1/2",
            "transition-all duration-200",
            "hover:bg-blue-600 hover:scale-110"
          )}
        />
      )}
      {handles.left && (
        <Handle
          type="target"
          position={Position.Left}
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-white left-0 -translate-x-1/2",
            "transition-all duration-200",
            "hover:bg-blue-600 hover:scale-110"
          )}
        />
      )}

      {/* Node Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 border-b border-gray-100 rounded-t-xl",
          "bg-gray-50/50 backdrop-blur-sm",
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        {showDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>

      {/* Node Content */}
      <div className={cn("p-3", contentClassName)}>
        {children}
      </div>
    </motion.div>
  );
}