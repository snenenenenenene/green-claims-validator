import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface Commit {
  version: number;
  date: string;
  message: string;
  chartInstances: ChartInstance[];
}

interface StoreState {
  chartInstances: ChartInstance[];
  currentDashboardTab: string;
  currentQuestionnaireTab: string;
  questions: any[];
  onePage: boolean;
  localCommits: Commit[];
  globalCommits: Commit[];
  currentWeight: number;
  setCurrentDashboardTab: (tabName: string) => void;
  setCurrentQuestionnaireTab: (tabName: string) => void;
  addNewTab: (newTabName: string) => void;
  setNodesAndEdges: (instanceName: string, nodes: Node[], edges: Edge[]) => void;
  setOnePage: (value: boolean) => void;
  removeNode: (instanceName: string, nodeId: string) => void;
  deleteTab: (tabName: string) => void;
  publishTab: () => void;
  saveToDb: () => void;
  setCurrentTabColor: (instanceName: string, color: string) => void;
  setChartInstance: (newInstance: ChartInstance) => void;
  setChartInstances: (newInstances: ChartInstance[]) => void;
  generateQuestions: () => void;
  addLocalCommit: (message: string) => void;
  revertToLocalCommit: (message: string) => void;
  addGlobalCommit: (message: string) => void;
  revertToGlobalCommit: (message: string) => void;
  setCurrentWeight: (weight: number) => void;
  resetCurrentWeight: () => void;
  getCurrentWeight: () => number;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: [],
      currentDashboardTab: "",
      currentQuestionnaireTab: "",
      questions: [],
      onePage: false,
      localCommits: [],
      globalCommits: [],
      currentWeight: 1,

      setCurrentDashboardTab: (tabName: string) => {
        set({ currentDashboardTab: tabName });
      },

      setCurrentQuestionnaireTab: (tabName: string) => {
        set({ currentQuestionnaireTab: tabName });
      },

      addNewTab: (newTabName: string) => {
        const newTab: ChartInstance = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
          color: "#80B500",
          publishedVersions: [],
        };
        const updatedTabs = [...get().chartInstances, newTab];
        set({
          chartInstances: updatedTabs,
          currentDashboardTab: newTabName,
          onePage: false,
        });
      },

      setNodesAndEdges: (instanceName: string, nodes: Node[], edges: Edge[]) => {
        const updatedInstances = get().chartInstances.map((instance) => {
          if (instance.name === instanceName) {
            return { ...instance, initialNodes: nodes, initialEdges: edges };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      setOnePage: (value: boolean) => {
        const { currentDashboardTab, chartInstances } = get();
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentDashboardTab) {
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
              initialNodes: instance.initialNodes.filter((node) => node.id !== nodeId),
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
        const updatedInstances = get().chartInstances.filter(
          (instance) => instance.name !== tabName,
        );
        const newCurrentDashboardTab = updatedInstances.length > 0 ? updatedInstances[0].name : "";
        const newCurrentQuestionnaireTab = updatedInstances.length > 0 ? updatedInstances[0].name : "";
        set({ chartInstances: updatedInstances, currentDashboardTab: newCurrentDashboardTab, currentQuestionnaireTab: newCurrentQuestionnaireTab });
      },

      publishTab: () => {
        const { currentDashboardTab, chartInstances } = get() as StoreState;
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === currentDashboardTab) {
            const newVersion = {
              version: (instance.publishedVersions?.length || 0) + 1,
              date: new Date().toISOString(),
              initialNodes: instance.initialNodes,
              initialEdges: instance.initialEdges,
            };
            return {
              ...instance,
              publishedVersions: [...(instance.publishedVersions || []), newVersion],
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
            return { ...instance, color };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      saveToDb: () => {
        const { currentDashboardTab, chartInstances } = get();
        const currentInstance = chartInstances.find((instance) => instance.name === currentDashboardTab);

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
        set({ chartInstances: updatedInstances, currentDashboardTab: newInstance.name, currentQuestionnaireTab: newInstance.name });
      },

      setChartInstances: (newInstances: ChartInstance[]) => {
        set({ chartInstances: newInstances });
      },

      generateQuestions: () => {
        const { chartInstances, currentQuestionnaireTab } = get();
        const currentInstance = chartInstances.find((instance) => instance.name === currentQuestionnaireTab);
        if (currentInstance) {
          const questions = generateQuestionsFromChart(currentInstance);
          set({ questions });
          toast.success("Questions generated successfully!");
        } else {
          toast.error("No current instance found.");
        }
      },

      addLocalCommit: (message: string) => {
        const { chartInstances, currentDashboardTab, localCommits } = get();
        const currentInstance = chartInstances.find((instance) => instance.name === currentDashboardTab);

        if (currentInstance) {
          const newCommit = {
            version: localCommits.length + 1,
            date: new Date().toISOString(),
            message,
            chartInstances: [currentInstance],
          };
          set({ localCommits: [...localCommits, newCommit] });
          toast.success("Local commit added.");
        }
      },

      revertToLocalCommit: (message: string) => {
        const { localCommits, setChartInstance } = get();
        const commit = localCommits.find((commit) => commit.message === message);

        if (commit && commit.chartInstances.length > 0) {
          setChartInstance(commit.chartInstances[0]);
          toast.success("Reverted to selected local commit.");
        }
      },

      addGlobalCommit: (message: string) => {
        const { chartInstances, globalCommits } = get();
        const newCommit = {
          version: globalCommits.length + 1,
          date: new Date().toISOString(),
          message,
          chartInstances,
        };
        set({ globalCommits: [...globalCommits, newCommit] });
        toast.success("Global commit added.");
      },

      revertToGlobalCommit: (message: string) => {
        const { globalCommits } = get();
        const commit = globalCommits.find((commit) => commit.message === message);

        if (commit) {
          set({ chartInstances: commit.chartInstances });
          toast.success("Reverted to selected global commit.");
        }
      },

      setCurrentWeight: (weight: number) => {
        set({ currentWeight: weight });
      },

      resetCurrentWeight: () => {
        set({ currentWeight: 1 });
      },

      getCurrentWeight: () => {
        return get().currentWeight;
      }
    }),
    {
      name: "flow-chart-store",
    },
  ),
);

export default useStore;
