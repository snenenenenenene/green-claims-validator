import create from "zustand";
import { persist } from "zustand/middleware";
import { chartInstances as initialChartInstances } from "@/app/data/charts";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

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
  publishedVersions?: { version: number; date: string }[]; // Add published versions
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
  publishTab: () => void;
  saveToDb: () => void;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({

      chartInstances: initialChartInstances.map((instance) => ({
        ...instance,
        onePageMode: false,
        publishedVersions: [], // Initialize with empty published versions
      })),
      currentTab: initialChartInstances[0].name,
      onePage: (initialChartInstances[0] as any).onePageMode || false,

      setCurrentTab: (tabName: string) => {
        const currentInstance = (get() as StoreState).chartInstances.find(
          (instance: ChartInstance) => instance.name === tabName,
        );
        set({
          currentTab: tabName,
          onePage: currentInstance?.onePageMode || false,
        });
      },

      addNewTab: (newTabName: string) => {
        const newTab: ChartInstance = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
          publishedVersions: [],
        };
        const updatedTabs = [...(get() as StoreState).chartInstances, newTab];
        set({
          chartInstances: updatedTabs,
          currentTab: newTabName,
          onePage: false,
        });
      },

      setNodesAndEdges: (instanceName: string, nodes: Node, edges: Edge) => {
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance: ChartInstance) => {
            if (instance.name === instanceName) {
              return { ...instance, initialNodes: nodes, initialEdges: edges };
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances });
      },

      setOnePage: (value: boolean) => {
        const { currentTab, chartInstances } = get() as StoreState;
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentTab) {
            return { ...instance, onePageMode: value };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances, onePage: value });
      },

      removeNode: (instanceName: string, nodeId: string) => {
        const updatedInstances = (get() as StoreState).chartInstances.map((instance) => {
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

      deleteTab: (tabName: string) => {
        const updatedInstances = (get() as StoreState).chartInstances.filter(
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

      publishTab: () => {
        const { currentTab, chartInstances } = get() as StoreState;
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentTab) {
            const newVersion = {
              version: (instance.publishedVersions?.length || 0) + 1,
              date: new Date().toISOString(),
            };
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
      },
      
      saveToDb: () => {
        const { currentTab, chartInstances } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance: ChartInstance) => instance.name === currentTab,
        );

        console.log(`current instance ${JSON.stringify(currentInstance)}`)
        axios.post('/api/charts', {
          currentInstance
        })
      }

    }),
    {
      name: "flow-chart-store",
    },
  ) as any,
);

export default useStore;
