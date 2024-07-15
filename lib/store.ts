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
  onePageMode?: boolean;
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
  deleteTab: (tabName: string) => void;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: initialChartInstances.map((instance) => ({
        ...instance,
        onePageMode: false, // Initialize with onePageMode as false
      })),
      currentTab: initialChartInstances[0].name,
      onePage: initialChartInstances[0].onePageMode || false,

      setCurrentTab: (tabName) => {
        const currentInstance = get().chartInstances.find(
          (instance) => instance.name === tabName,
        );
        set({
          currentTab: tabName,
          onePage: currentInstance?.onePageMode || false,
        });
      },

      addNewTab: (newTabName) => {
        const newTab: ChartInstance = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
        };
        const updatedTabs = [...get().chartInstances, newTab];
        set({
          chartInstances: updatedTabs,
          currentTab: newTabName,
          onePage: false,
        });
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

      setOnePage: (value) => {
        const { currentTab, chartInstances } = get();
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentTab) {
            return { ...instance, onePageMode: value };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances, onePage: value });
      },

      removeNode: (instanceName, nodeId) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return {
              ...instance,
              initialNodes: instance.initialNodes.filter(
                (node) => node.id !== nodeId,
              ),
              initialEdges: instance.initialEdges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId,
              ),
            };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      deleteTab: (tabName) => {
        const updatedInstances = get().chartInstances.filter(
          (instance) => instance.name !== tabName,
        );
        const newCurrentTab =
          updatedInstances.length > 0 ? updatedInstances[0].name : null;
        set({
          chartInstances: updatedInstances,
          currentTab: newCurrentTab,
          onePage: newCurrentTab
            ? updatedInstances[0].onePageMode || false
            : false,
        });
      },
    }),
    {
      name: "flow-chart-store",
    },
  ),
);

export default useStore;
