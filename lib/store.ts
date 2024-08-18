import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";

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
  currentQuestionIndex: number;
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
  setCurrentWeight: (weight: number) => void;
  resetCurrentWeight: () => void;
  getCurrentWeight: () => number;
  incrementCurrentQuestionIndex: () => void;
  resetCurrentQuestionIndex: () => void;
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

      setCurrentDashboardTab: (tabName) => set({ currentDashboardTab: tabName }),
      setCurrentQuestionnaireTab: (tabName) => set({ currentQuestionnaireTab: tabName }),
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
          chartInstances: [...get().chartInstances, newTab],
          currentDashboardTab: newTabName,
          onePage: false,
        });
      },
      setNodesAndEdges: (instanceName, nodes, edges) => {
        set({
          chartInstances: get().chartInstances.map((instance) =>
            instance.name === instanceName
              ? { ...instance, initialNodes: nodes, initialEdges: edges }
              : instance
          ),
        });
      },
      setOnePage: (value) => {
        const { currentDashboardTab, chartInstances } = get();
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
          chartInstances: get().chartInstances.map((instance) =>
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
        const updatedInstances = get().chartInstances.filter(
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
        const { currentDashboardTab, chartInstances } = get();
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
        const { currentDashboardTab, chartInstances } = get();
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentDashboardTab
        );
        axios.post("/api/charts", { currentInstance });
        toast.success(`Successfully saved ${currentInstance?.name} to the database.`);
      },
      setChartInstance: (newInstance) => {
        set({
          chartInstances: get().chartInstances.map((instance) =>
            instance.name === newInstance.name ? newInstance : instance
          ),
          currentDashboardTab: newInstance.name,
          currentQuestionnaireTab: newInstance.name,
        });
      },
      setChartInstances: (newInstances) => set({ chartInstances: newInstances }),
      generateQuestions: () => {
        const { chartInstances, currentQuestionnaireTab } = get();
        const currentInstance = chartInstances.find(
          (instance) => instance.name === currentQuestionnaireTab
        );
        if (currentInstance) {
          let questions = generateQuestionsFromChart(currentInstance);
          let index = 0;

          // Skip initial weight nodes
        
          console.log(questions[index])
          while (questions[index] && questions[index].type === "weightNode") {
            const accumulatedWeight = get().currentWeight * questions[index].weight;
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
      getCurrentWeight: () => get().currentWeight,
      incrementCurrentQuestionIndex: () => set(state => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
      resetCurrentQuestionIndex: () => set({ currentQuestionIndex: 0 }),
      addLocalCommit: (message) => {
        const { chartInstances, currentDashboardTab, localCommits } = get();
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
        const { localCommits, setChartInstance } = get();
        const commit = localCommits.find((commit) => commit.message === message);
        if (commit && commit.chartInstances.length > 0) {
          setChartInstance(commit.chartInstances[0]);
          toast.success("Reverted to selected local commit.");
        }
      },
      addGlobalCommit: (message) => {
        const { chartInstances, globalCommits } = get();
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
        const { globalCommits } = get();
        const commit = globalCommits.find((commit) => commit.message === message);
        if (commit) {
          set({ chartInstances: commit.chartInstances });
          toast.success("Reverted to selected global commit.");
        }
      },
    }),
    {
      name: "flow-chart-store", // unique name for the storage key
    }
  )
);

export default useStore;
