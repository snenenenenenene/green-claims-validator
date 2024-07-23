// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chartInstances as initialChartInstances } from "@/app/data/charts";
import axios from "axios";
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";

interface NodeData {
  label: string;
  options?: { label: string; nextNodeId?: string }[];
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
  publishedVersions?: { version: number; date: string }[];
}

interface StoreState {
  chartInstances: ChartInstance[];
  currentTab: string;
  questions: any[];
  onePage: boolean;
  setCurrentTab: (tabName: string) => void;
  addNewTab: (newTabName: string) => void;
  setNodesAndEdges: (instanceName: string, nodes: Node[], edges: Edge[]) => void;
  setOnePage: (value: boolean) => void;
  removeNode: (instanceName: string, nodeId: string) => void;
  deleteTab: (tabName: string) => void;
  publishTab: () => void;
  saveToDb: () => void;
  setCurrentTabColor: (instanceName: string, color: string) => void;
  setChartInstance: (newInstance: ChartInstance) => void;
  generateQuestions: () => void;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: initialChartInstances.map((instance) => ({
        ...instance,
        onePageMode: false,
        color: "#ffffff",
        publishedVersions: [],
      })),
      currentTab: initialChartInstances[0]?.name || "",
      questions: [],
      onePage: initialChartInstances[0]?.onePageMode || false,

      setCurrentTab: (tabName: string) => {
        const currentInstance = get().chartInstances.find(
          (instance: ChartInstance) => instance.name === tabName
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
        const updatedTabs = [...get().chartInstances, newTab];
        set({
          chartInstances: updatedTabs,
          currentTab: newTabName,
          onePage: false,
        });
      },

      setNodesAndEdges: (instanceName: string, nodes: Node[], edges: Edge[]) => {
        const updatedInstances = get().chartInstances.map((instance: ChartInstance) => {
          if (instance.name === instanceName) {
            return { ...instance, initialNodes: nodes, initialEdges: edges };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      setOnePage: (value: boolean) => {
        const { currentTab, chartInstances } = get();
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentTab) {
            return { ...instance, onePageMode: value };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      removeNode: (instanceName: string, nodeId: string) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return {
              ...instance,
              initialNodes: instance.initialNodes.filter((node: any) => node.id !== nodeId),
              initialEdges: instance.initialEdges.filter(
                (edge: any) => edge.source !== nodeId && edge.target !== nodeId
              ),
            };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      deleteTab: (tabName: string) => {
        const updatedInstances = get().chartInstances.filter(
          (instance) => instance.name !== tabName
        );
        const newCurrentTab = updatedInstances.length > 0 ? updatedInstances[0].name : "Default";
        set({ chartInstances: updatedInstances, currentTab: newCurrentTab });
      },

      publishTab: () => {
        const { currentTab, chartInstances } = get();
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
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return { ...instance, color: color };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      saveToDb: () => {
        const { currentTab, chartInstances } = get();
        const currentInstance = chartInstances.find(
          (instance: ChartInstance) => instance.name === currentTab
        );

        axios.post("/api/charts", { currentInstance });
        toast.success(`Successfully saved ${currentInstance?.name} to the database.`);
      },

      setChartInstance: (newInstance: ChartInstance) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === newInstance.name) {
            return newInstance;
          }
          return instance;
        });
        set({ chartInstances: updatedInstances, currentTab: newInstance.name });
      },

      generateQuestions: () => {
        const { chartInstances, currentTab } = get();
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentTab
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
    }
  ) as any
);

export default useStore;
