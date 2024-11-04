// types/nodes.ts
import { Node, Edge } from 'reactflow';

export interface BaseNodeData {
  instanceId: string;
  label?: string;
  style?: React.CSSProperties;
}

export interface ChoiceOption {
  id: string;
  label: string;
  nextNodeId: string | null;
}

export interface YesNoNodeData extends BaseNodeData {
  question: string;
  options: Array<{ label: 'yes' | 'no'; nextNodeId: string | null }>;
}

export interface SingleChoiceNodeData extends BaseNodeData {
  question: string;
  options: ChoiceOption[];
}

export interface MultipleChoiceNodeData extends BaseNodeData {
  question: string;
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface WeightNodeData extends BaseNodeData {
  weight: number;
  nextNodeId: string | null;
  previousQuestionIds: string[];
  options: Array<{ label: 'DEFAULT'; nextNodeId: string | null }>;
}

export interface FunctionNodeVariable {
  name: string;
  value: string | number;
  type: 'string' | 'number' | 'boolean';
}

export interface FunctionNodeSequence {
  type: 'if' | 'else' | 'addition' | 'subtraction' | 'multiplication' | 'division';
  value?: number;
  condition?: '>' | '<' | '==' | '>=' | '<=';
  variable?: string;
  handleId?: string;
  children?: FunctionNodeSequence[];
}

export interface FunctionNodeData extends BaseNodeData {
  variableScope: 'local' | 'global';
  selectedVariable: string;
  sequences: FunctionNodeSequence[];
  handles: string[];
}

export interface StartNodeData extends BaseNodeData {
  options: Array<{ label: 'DEFAULT'; nextNodeId: string | null }>;
}

export interface EndNodeData extends BaseNodeData {
  endType: 'end' | 'redirect';
  redirectTab?: string;
}

export type NodeTypes = {
  yesNo: YesNoNodeData;
  singleChoice: SingleChoiceNodeData;
  multipleChoice: MultipleChoiceNodeData;
  weightNode: WeightNodeData;
  functionNode: FunctionNodeData;
  startNode: StartNodeData;
  endNode: EndNodeData;
}

export type NodeData = 
  | YesNoNodeData 
  | SingleChoiceNodeData 
  | MultipleChoiceNodeData 
  | WeightNodeData 
  | FunctionNodeData 
  | StartNodeData 
  | EndNodeData;

// Chart instance related types
export interface ChartInstance {
  id: string;
  name: string;
  color: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  variables?: FunctionNodeVariable[];
  onePageMode?: boolean;
  hasUnsavedChanges?: boolean;
}

// Store related types
export interface ChartStore {
  chartInstances: ChartInstance[];
  currentDashboardTab: string | null;
  getChartInstance: (id: string) => ChartInstance | undefined;
  setChartInstances: (instances: ChartInstance[]) => void;
  setCurrentDashboardTab: (id: string) => void;
  updateNodeData: (instanceId: string, nodeId: string, data: NodeData) => void;
  updateNodes: (instanceId: string, changes: any[]) => void;
  updateEdges: (instanceId: string, changes: any[]) => void;
  addNode: (instanceId: string, node: Node) => void;
  addEdge: (instanceId: string, edge: Edge) => void;
  removeNode: (instanceId: string, nodeId: string) => void;
  removeEdge: (instanceId: string, edgeId: string) => void;
}

// Utils for type checking
export const isYesNoNode = (data: NodeData): data is YesNoNodeData => {
  return 'options' in data && data.options.some(opt => opt.label === 'yes' || opt.label === 'no');
};

export const isSingleChoiceNode = (data: NodeData): data is SingleChoiceNodeData => {
  return 'options' in data && !('minSelections' in data) && !('weight' in data) && !('sequences' in data);
};

export const isMultipleChoiceNode = (data: NodeData): data is MultipleChoiceNodeData => {
  return 'options' in data && 'minSelections' in data;
};

export const isWeightNode = (data: NodeData): data is WeightNodeData => {
  return 'weight' in data;
};

export const isFunctionNode = (data: NodeData): data is FunctionNodeData => {
  return 'sequences' in data;
};

export const isStartNode = (data: NodeData): data is StartNodeData => {
  return 'options' in data && data.options.length === 1 && data.options[0].label === 'DEFAULT';
};

export const isEndNode = (data: NodeData): data is EndNodeData => {
  return 'endType' in data;
};

// Constants
export const DEFAULT_NODE_QUESTIONS = {
  yesNo: "Does your claim meet this requirement?",
  singleChoice: "Select one of the following options:",
  multipleChoice: "Select all that apply:",
} as const;

// Validation types
export interface ValidationError {
  nodeId: string;
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type ValidationFunction = (node: Node<NodeData>, instance: ChartInstance) => ValidationError[];