import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

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
  id: string;
  name: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  color: string;
  onePageMode?: boolean;
  publishedVersions?: { version: number; date: string }[];
  variables?: { name: string; value: string }[]; // Local variables specific to this chart
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
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
  updateChartInstanceName: (tabId: string, newName: string) => void;

  // Variables
  variables: {
    global: { name: string; value: string }[];
  };
  setVariables: (variables: { global: any[] }) => void;
  addLocalVariable: (tabId: string, variable: { name: string; value: string }) => void;
  deleteLocalVariable: (tabId: string, variableIndex: number) => void;

  // Modal state
  modalContent: React.ReactNode;
  isModalOpen: boolean;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;

  // Setters and Methods
  setCurrentDashboardTab: (tabId: string) => void;
  setCurrentQuestionnaireTab: (tabId: string) => void;
  addNewTab: (newTabName: string) => void;
  setNodesAndEdges: (tabId: string, nodes: Node[], edges: Edge[]) => void;
  setOnePage: (value: boolean) => void;
  removeNode: (tabId: string, nodeId: string) => void;
  deleteTab: (tabId: string) => void;
  publishTab: () => void;
  saveToDb: () => void;
  setCurrentTabColor: (tabId: string, color: string) => void;
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
      currentTab: "",

      variables: {
        global: [],
      },
      modalContent: null,
      isModalOpen: false,
      openModal: (content) => set({ modalContent: content, isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      setCurrentDashboardTab: (tabId) => set({ currentDashboardTab: tabId }),
      setCurrentQuestionnaireTab: (tabId) => set({ currentQuestionnaireTab: tabId }),
      setCurrentTab: (tabId) => set({ currentTab: tabId }),

      addNewTab: (newTabName) => {
        const newTab: ChartInstance = {
          id: uuidv4(),
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
          color: "#80B500",
          publishedVersions: [],
          variables: [], // Initialize with an empty array for local variables
        };
        set({
          chartInstances: [...(get() as StoreState).chartInstances, newTab],
          currentDashboardTab: newTab.id,
          onePage: false,
        });
      },

      setNodesAndEdges: (tabId, nodes, edges) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.id === tabId
              ? { ...instance, initialNodes: nodes, initialEdges: edges }
              : instance
          ),
        });
      },

      setOnePage: (value) => {
        const { currentDashboardTab, chartInstances } = get() as StoreState;
        set({
          chartInstances: chartInstances.map((instance) =>
            instance.id === currentDashboardTab
              ? { ...instance, onePageMode: value }
              : instance
          ),
        });
      },

      removeNode: (tabId, nodeId) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.id === tabId
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

      deleteTab: (tabId) => {
        const updatedInstances = (get() as StoreState).chartInstances.filter(
          (instance) => instance.id !== tabId
        );
        const newCurrentTab = updatedInstances.length > 0 ? updatedInstances[0].id : "";
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
            instance.id === currentDashboardTab
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
          (instance) => instance.id === currentDashboardTab
        );
        axios.post("/api/charts", { currentInstance });
        toast.success(`Successfully saved ${currentInstance?.name} to the database.`);
      },

      setChartInstance: (newInstance) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.id === newInstance.id ? newInstance : instance
          ),
          currentDashboardTab: newInstance.id,
          currentQuestionnaireTab: newInstance.id,
        });
      },

      setChartInstances: (newInstances) => set({ chartInstances: newInstances }),

      generateQuestions: () => {
        const { chartInstances, currentQuestionnaireTab } = get() as StoreState;
        const currentInstance = chartInstances.find(
          (instance) => instance.id === currentQuestionnaireTab
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
          (instance) => instance.id === currentDashboardTab
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

      updateChartInstanceName: (tabId, newName) => {
        const updatedInstances = (get() as StoreState).chartInstances.map((instance) =>
          instance.id === tabId ? { ...instance, name: newName } : instance
        );
        set({ chartInstances: updatedInstances });
        set({ currentTab: tabId });
      },

      setVariables: (variables) => set({ variables }),

      addLocalVariable: (tabId, variable) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) =>
            instance.id === tabId
              ? {
                  ...instance,
                  variables: [...(instance.variables || []), variable],
                }
              : instance
          ),
        });
      },

      deleteLocalVariable: (tabId, variableIndex) => {
        set({
          chartInstances: (get() as StoreState).chartInstances.map((instance) => {
            if (instance.id === tabId) {
              const updatedVariables = [...(instance.variables || [])];
              updatedVariables.splice(variableIndex, 1);
              return {
                ...instance,
                variables: updatedVariables,
              };
            }
            return instance;
          }),
        });
      },
    }),
    {
      name: "flow-chart-store", // unique name for the storage key
    }
  )
);

export default useStore;
