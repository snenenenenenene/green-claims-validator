import create from "zustand";
import { persist } from "zustand/middleware";
import { chartInstances as initialChartInstances } from "@/app/data/charts";

interface NodeData {
  label: string;
  options?: string[];
  endType?: string;
  redirectTab?: string;
}

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface ChartInstance {
  name: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

interface StoreState {
  chartInstances: ChartInstance[];
  currentTab: string;
  onePage: boolean;
  setCurrentTab: (tabName: string) => void;
  addNewTab: (newTabName: string) => void;
  setNodesAndEdges: (
    instanceName: string,
    nodes: Node[],
    edges: Edge[],
  ) => void;
  setOnePage: (value: boolean) => void;
  removeNode: (instanceName: string, nodeId: string) => void;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: initialChartInstances,
      currentTab: initialChartInstances[0].name,
      onePage: false,

      setCurrentTab: (tabName) => set({ currentTab: tabName }),

      addNewTab: (newTabName) => {
        const newTab: ChartInstance = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
        };
        const updatedTabs = [...get().chartInstances, newTab];
        set({ chartInstances: updatedTabs, currentTab: newTabName });
      },

      setNodesAndEdges: (instanceName, nodes, edges) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return { ...instance, initialNodes: nodes, initialEdges: edges };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      setOnePage: (value) => set({ onePage: value }),

      removeNode: (instanceName, nodeId) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return {
              ...instance,
              initialNodes: instance.initialNodes.filter((node) => node.id !== nodeId),
              initialEdges: instance.initialEdges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
              ),
            };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },
    }),
    {
      name: "flow-chart-store",
    },
  ),
);

export default useStore;
