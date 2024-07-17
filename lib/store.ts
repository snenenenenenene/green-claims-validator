import create from "zustand";
import { persist } from "zustand/middleware";
import { chartInstances as initialChartInstances } from "@/app/data/charts";
import toast from "react-hot-toast";

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
  color?: string;
  publishedVersions?: { version: number; date: string }[]; // Add published versions
}

interface StoreState {
  chartInstances: ChartInstance[];
  currentTab: string;
  setCurrentTab: (tabName: string) => void;
  addNewTab: (newTabName: string) => void;
  setNodesAndEdges: (
    instanceName: string,
    nodes: Node[],
    edges: Edge[],
  ) => void;
  setOnePage: (instanceName: string, value: boolean) => void;
  removeNode: (instanceName: string, nodeId: string) => void;
  deleteTab: (tabName: string) => void;
  publishTab: () => void;
  setCurrentTabColor: (instanceName: string, color: string) => void;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: initialChartInstances.map((instance) => ({
        ...instance,
        onePageMode: false,
        color: "#ffffff",
        publishedVersions: [], // Initialize with empty published versions
      })),
      currentTab: initialChartInstances[0].name,

      setCurrentTab: (tabName) => {
        const currentInstance = get().chartInstances.find(
          (instance) => instance.name === tabName,
        );
        set({
          currentTab: tabName,
        });
      },

      addNewTab: (newTabName) => {
        const newTab: ChartInstance = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
          color: "#ffffff",
          publishedVersions: [],
        };
        const updatedTabs = [...get().chartInstances, newTab];
        set({
          chartInstances: updatedTabs,
          currentTab: newTabName,
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

      setOnePage: (instanceName, value) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return { ...instance, onePageMode: value };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
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
        });
      },

      publishTab: () => {
        const { currentTab, chartInstances } = get();
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentTab,
        );

        if (!currentInstance) {
          toast.error("No current tab selected.");
          return;
        }

        if (currentInstance.initialNodes.length === 0) {
          toast.error("Cannot publish. No nodes in the diagram.");
          return;
        }

        const hasStartNode = currentInstance.initialNodes.some(
          (node) => node.type === "startNode",
        );
        const hasEndNode = currentInstance.initialNodes.some(
          (node) => node.type === "endNode",
        );

        if (!hasStartNode) {
          toast.error("Cannot publish. No start node found.");
          return;
        }

        if (!hasEndNode) {
          toast.error("Cannot publish. No end node found.");
          return;
        }

        const newVersion = {
          version: (currentInstance.publishedVersions?.length || 0) + 1,
          date: new Date().toISOString(),
        };

        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentTab) {
            return {
              ...instance,
              publishedVersions: [
                ...(instance.publishedVersions || []),
                newVersion,
              ],
            };
          }
          return instance;
        });

        set({ chartInstances: updatedInstances });
        toast.success("Published successfully.");
      },

      setCurrentTabColor: (instanceName, color) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return { ...instance, color: color };
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
