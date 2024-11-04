// components/dashboard/nodes/index.ts
import BaseNode from './BaseNode';
import EndNode from './EndNode';
import FunctionNode from './FunctionNode';
import MultipleChoiceNode from './MultipleChoiceNode';
import SingleChoiceNode from './SingleChoiceNode';
import StartNode from './StartNode';
import WeightNode from './WeightNode';
import YesNoNode from './YesNoNode';

export {
  BaseNode,
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode,
};

// Export node type mapping for ReactFlow
export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  yesNo: YesNoNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  weightNode: WeightNode,
  functionNode: FunctionNode,
} as const;

// Export node configs for sidebar and node creation
export const nodeConfigs = [
  {
    type: 'startNode',
    label: 'Start Node',
    description: 'Beginning of the flow',
    icon: '▶️',
    category: 'basic',
    color: 'emerald',
  },
  {
    type: 'endNode',
    label: 'End Node',
    description: 'End of the flow',
    icon: '⏹️',
    category: 'basic',
    color: 'red',
  },
  {
    type: 'yesNo',
    label: 'Yes/No Question',
    description: 'Binary choice question',
    icon: '❓',
    category: 'question',
    color: 'green',
  },
  {
    type: 'singleChoice',
    label: 'Single Choice',
    description: 'One option from many',
    icon: '☝️',
    category: 'question',
    color: 'purple',
  },
  {
    type: 'multipleChoice',
    label: 'Multiple Choice',
    description: 'Multiple selections allowed',
    icon: '✨',
    category: 'question',
    color: 'indigo',
  },
  {
    type: 'weightNode',
    label: 'Weight Node',
    description: 'Adjusts scoring weight',
    icon: '⚖️',
    category: 'logic',
    color: 'amber',
  },
  {
    type: 'functionNode',
    label: 'Function Node',
    description: 'Custom logic operations',
    icon: '🔧',
    category: 'logic',
    color: 'violet',
  },
] as const;

// Categories configuration
export const nodeCategories = [
  { id: 'all', label: 'All Nodes' },
  { id: 'basic', label: 'Basic' },
  { id: 'question', label: 'Questions' },
  { id: 'logic', label: 'Logic' },
] as const;

// Type utilities
export type NodeType = typeof nodeTypes;
export type NodeConfig = typeof nodeConfigs[number];
export type NodeCategory = typeof nodeCategories[number];

// Utilities
export const getNodeConfig = (type: keyof NodeType) => {
  return nodeConfigs.find(config => config.type === type);
};

export const getCategoryNodes = (category: string) => {
  if (category === 'all') return nodeConfigs;
  return nodeConfigs.filter(config => config.category === category);
};