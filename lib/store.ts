// lib/store.ts
import { create } from "zustand";
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
  color: string;
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
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";

const useStore = create<any>(
  persist(
    (set, get) => ({
      chartInstances: initialChartInstances.map((instance) => ({
        ...instance,
        onePageMode: false,
        color: "#ffffff",
        publishedVersions: [],
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
          color: "#ffffff",
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
        set({ chartInstances: updatedInstances });
      },

      removeNode: (instanceName: string, nodeId: string) => {
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance) => {
            if (instance.name === instanceName) {
              return {
                ...instance,
                initialNodes: instance.initialNodes.filter(
                  (node: any) => node.id !== nodeId,
                ),
                initialEdges: instance.initialEdges.filter(
                  (edge: any) =>
                    edge.source !== nodeId && edge.target !== nodeId,
                ),
              };
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances });
      },

      deleteTab: (tabName: string) => {
        const updatedInstances = (get() as StoreState).chartInstances.filter(
          (instance) => instance.name !== tabName,
        );
        const newCurrentTab =
          updatedInstances.length > 0 ? updatedInstances[0].name : "";
        set({ chartInstances: updatedInstances, currentTab: newCurrentTab });
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
        toast.success("Published successfully.");
      },

      setCurrentTabColor: (instanceName: string, color: string) => {
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance: any) => {
            if (instance.name === instanceName) {
              return { ...instance, color: color };
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances });
      },

      saveToDb: () => {
        const { currentTab, chartInstances } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance: ChartInstance) => instance.name === currentTab,
        );

        console.log(`current instance ${JSON.stringify(currentInstance)}`);
        axios.post("/api/charts", {
          currentInstance,
        });
        toast.success(
          `Successfully saved ${currentInstance?.name} to the database.`,
        );
      },
      setChartInstance: (newInstance: any) => {
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance: any) => {
            if (instance.name === newInstance.name) {
              return newInstance;
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances, currentTab: newInstance.name });
      },
      generateQuestions: () => {
        const { chartInstances, currentTab } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance: any) => instance.name === currentTab,
        );
        if (currentInstance) {
          const questions = generateQuestionsFromChart(currentInstance);
          set({ questions });
          toast.success("Questions generated successfully!");
        } else {
          toast.error("No current instance found.");
        }
      },
    }),
    {
      name: "flow-chart-store",
    },
  ) as any,
);

export default useStore;
