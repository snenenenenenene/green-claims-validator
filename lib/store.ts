import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";

// Interfaces for Nodes, Edges, and Chart Instances
interface NodeData {
  label: string;
  options?: { label: string; nextNodeId?: string, nextChartId?: string, nextChartName?: string }[];
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

// Interface for Commit
interface Commit {
  version: number;
  date: string;
  message: string;
  chartInstances: ChartInstance[];
}

// Interface for the store's state
interface StoreState {
  chartInstances: ChartInstance[];
  currentDashboardTab: string;
  currentQuestionnaireTab: string;
  currentQuestionIndex: number;
  questions: any[];
  onePage: boolean;
  localCommits: Commit[];
  globalCommits: Commit[];
  currentWeight: number;
  currentTab: string; // Added currentTab
  setCurrentTab: (tabName: string) => void; // Added setCurrentTab method
  updateChartInstanceName: (oldName: string, newName: string) => void; // Added updateChartInstanceName method

  // Setters and Methods
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
  setCurrentWeight: (weight: number) => void;
  resetCurrentWeight: () => void;
  getCurrentWeight: () => number;
  updateCurrentWeight: (weightMultiplier: number) => void;
  incrementCurrentQuestionIndex: () => void;
  resetCurrentQuestionIndex: () => void;

  // Commit-related Methods
  addLocalCommit: (message: string) => void;
  revertToLocalCommit: (message: string) => void;
  addGlobalCommit: (message: string) => void;
  revertToGlobalCommit: (message: string) => void;
}

// Create Zustand store
const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: [],
      currentDashboardTab: "",
      currentQuestionnaireTab: "",
      currentQuestionIndex: 0,
      questions: [],
      onePage: false,
      localCommits: [],
      globalCommits: [],
      currentWeight: 1,
      currentTab: "", // Initialized currentTab

      setCurrentDashboardTab: (tabName) => set({ currentDashboardTab: tabName }),
      setCurrentQuestionnaireTab: (tabName) => set({ currentQuestionnaireTab: tabName }),
      setCurrentTab: (tabName) => set({ currentTab: tabName }), // Implementation of setCurrentTab
      addNewTab: (newTabName) => {
        const newTab: ChartInstance = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
          color: "#80B500",
          publishedVersions: [],
        };
        set({
          chartInstances: [...(get() as StoreState).chartInstances, newTab],
          currentDashboardTab: newTabName,
          onePage: false,
        });
      },
      setNodesAndEdges: (instanceName, nodes, edges) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.name === instanceName
              ? { ...instance, initialNodes: nodes, initialEdges: edges }
              : instance
          ),
        });
      },
      setOnePage: (value) => {
        const { currentDashboardTab, chartInstances } = get() as StoreState;
        set({
          chartInstances: chartInstances.map((instance) =>
            instance.name === currentDashboardTab
              ? { ...instance, onePageMode: value }
              : instance
          ),
        });
      },
      removeNode: (instanceName, nodeId) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.name === instanceName
              ? {
                  ...instance,
                  initialNodes: instance.initialNodes.filter(
                    (node) => node.id !== nodeId
                  ),
                  initialEdges: instance.initialEdges.filter(
                    (edge) => edge.source !== nodeId && edge.target !== nodeId
                  ),
                }
              : instance
          ),
        });
      },
      deleteTab: (tabName) => {
        const updatedInstances = (get() as StoreState).chartInstances.filter(
          (instance) => instance.name !== tabName
        );
        const newCurrentTab = updatedInstances.length > 0 ? updatedInstances[0].name : "";
        set({
          chartInstances: updatedInstances,
          currentDashboardTab: newCurrentTab,
          currentQuestionnaireTab: newCurrentTab,
        });
      },
      publishTab: () => {
        const { currentDashboardTab, chartInstances } = get() as StoreState;
        set({
          chartInstances: chartInstances.map((instance) =>
            instance.name === currentDashboardTab
              ? {
                  ...instance,
                  publishedVersions: [
                    ...(instance.publishedVersions || []),
                    {
                      version: (instance.publishedVersions?.length || 0) + 1,
                      date: new Date().toISOString(),
                    },
                  ],
                }
              : instance
          ),
        });
        toast.success("Published successfully.");
      },
      saveToDb: () => {
        const { currentDashboardTab, chartInstances } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentDashboardTab
        );
        axios.post("/api/charts", { currentInstance });
        toast.success(`Successfully saved ${currentInstance?.name} to the database.`);
      },
      setChartInstance: (newInstance) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.name === newInstance.name ? newInstance : instance
          ),
          currentDashboardTab: newInstance.name,
          currentQuestionnaireTab: newInstance.name,
        });
      },
      setChartInstances: (newInstances) => set({ chartInstances: newInstances }),
      generateQuestions: () => {
        const { chartInstances, currentQuestionnaireTab } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentQuestionnaireTab
        );
        if (currentInstance) {
          let questions = generateQuestionsFromChart(currentInstance);
          let index = 0;

          // Skip initial weight nodes
          while (questions[index] && (questions[index] as any).type === "weightNode") {
            const accumulatedWeight = (get() as StoreState).currentWeight * (questions[index] as any).weight;
            set({ currentWeight: accumulatedWeight });
            index += 1;
          }

          set({ questions });
          set({ currentQuestionIndex: index }); // Start from the first non-weight node
          toast.success("Questions generated successfully!");
        } else {
          toast.error("No current instance found.");
        }
      },
      setCurrentWeight: (weight) => set({ currentWeight: weight }),
      resetCurrentWeight: () => set({ currentWeight: 1 }),
      getCurrentWeight: () => (get() as StoreState).currentWeight,

      updateCurrentWeight: (weightMultiplier: number) => set((state) => ({
        currentWeight: state.currentWeight * weightMultiplier,
      })),

      incrementCurrentQuestionIndex: () => set(state => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
      resetCurrentQuestionIndex: () => set({ currentQuestionIndex: 0 }),

      addLocalCommit: (message) => {
        const { chartInstances, currentDashboardTab, localCommits } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentDashboardTab
        );
        if (currentInstance) {
          set({
            localCommits: [
              ...localCommits,
              {
                version: localCommits.length + 1,
                date: new Date().toISOString(),
                message,
                chartInstances: [currentInstance],
              },
            ],
          });
          toast.success("Local commit added.");
        }
      },
      revertToLocalCommit: (message) => {
        const { localCommits, setChartInstance } = get() as StoreState;
        const commit = localCommits.find((commit) => commit.message === message);
        if (commit && commit.chartInstances.length > 0) {
          setChartInstance(commit.chartInstances[0]);
          toast.success("Reverted to selected local commit.");
        }
      },
      addGlobalCommit: (message) => {
        const { chartInstances, globalCommits } = get() as StoreState;
        set({
          globalCommits: [
            ...globalCommits,
            {
              version: globalCommits.length + 1,
              date: new Date().toISOString(),
              message,
              chartInstances,
            },
          ],
        });
        toast.success("Global commit added.");
      },
      revertToGlobalCommit: (message) => {
        const { globalCommits } = get() as StoreState;
        const commit = globalCommits.find((commit) => commit.message === message);
        if (commit) {
          set({ chartInstances: commit.chartInstances });
          toast.success("Reverted to selected global commit.");
        }
      },

      // Implementation of updateChartInstanceName
      updateChartInstanceName: (oldName, newName) => {
        const updatedInstances = (get() as StoreState).chartInstances.map((instance) =>
          instance.name === oldName ? { ...instance, name: newName } : instance
        );
        set({ chartInstances: updatedInstances });
        set({ currentTab: newName });
      },
    }),
    {
      name: "flow-chart-store", // unique name for the storage key
    }
  ) as any
);

export default useStore;
