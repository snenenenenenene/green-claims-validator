import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chartInstances as initialChartInstances } from "@/app/data/charts";
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";
import axios from 'axios';

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
  publishedVersions?: { version: number; date: string; message: string }[];
}

export interface GlobalCommit {
  version: number;
  date: string;
  message: string;
  chartInstances: ChartInstance[];
}

interface StoreState {
  chartInstances: ChartInstance[];
  globalCommits: GlobalCommit[];
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
  commitLocalChanges: (message: string) => void;
  commitGlobalChanges: (message: string) => void;
  revertToLocalCommit: (message: string) => void;
  revertToGlobalCommit: (message: string) => void;
  setChartInstances: (chartInstances: ChartInstance[]) => void;
}

const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      chartInstances: initialChartInstances.map((instance) => ({
        ...instance,
        onePageMode: false,
        color: "#80B500",
        publishedVersions: [],
      })),
      globalCommits: [],
      currentTab: initialChartInstances[0]?.name || "",
      questions: [],
      onePage: (initialChartInstances[0] as any).onePageMode || false,

      setCurrentTab: (tabName: string) => {
        const decodedTabName = decodeURIComponent(tabName);
        const currentInstance = (get() as StoreState).chartInstances.find(
          (instance: ChartInstance) => instance.name === decodedTabName,
        );
        set({
          currentTab: decodedTabName,
          onePage: currentInstance?.onePageMode || false,
        });
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
        const updatedTabs = [...(get() as StoreState).chartInstances, newTab];
        set({
          chartInstances: updatedTabs,
          currentTab: newTabName,
          onePage: false,
        });
      },

      setNodesAndEdges: (instanceName: string, nodes: Node[], edges: Edge[]) => {
        const decodedInstanceName = decodeURIComponent(instanceName);
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance: ChartInstance) => {
            if (instance.name === decodedInstanceName) {
              return { ...instance, initialNodes: nodes, initialEdges: edges };
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances });
      },

      setOnePage: (value: boolean) => {
        const { currentTab, chartInstances } = get() as StoreState;
        const decodedTabName = decodeURIComponent(currentTab);
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === decodedTabName) {
            return { ...instance, onePageMode: value };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      removeNode: (instanceName: string, nodeId: string) => {
        const decodedInstanceName = decodeURIComponent(instanceName);
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance) => {
            if (instance.name === decodedInstanceName) {
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
        const decodedTabName = decodeURIComponent(tabName);
        const updatedInstances = (get() as StoreState).chartInstances.filter(
          (instance) => instance.name !== decodedTabName,
        );
        const newCurrentTab =
          updatedInstances.length > 0 ? updatedInstances[0].name : "Default";
        set({ chartInstances: updatedInstances, currentTab: newCurrentTab });
      },

      publishTab: () => {
        const { currentTab, chartInstances } = get() as StoreState;
        const decodedTabName = decodeURIComponent(currentTab);
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === decodedTabName) {
            const newVersion = {
              version: (instance.publishedVersions?.length || 0) + 1,
              date: new Date().toISOString(),
              message: `Published version ${(instance.publishedVersions?.length || 0) + 1}`,
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
        const decodedInstanceName = decodeURIComponent(instanceName);
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance) => {
            if (instance.name === decodedInstanceName) {
              return { ...instance, color: color };
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances });
      },

      saveToDb: () => {
        const { currentTab, chartInstances } = get() as StoreState;
        const decodedTabName = decodeURIComponent(currentTab);
        const currentInstance = chartInstances.find(
          (instance: ChartInstance) => instance.name === decodedTabName,
        );

        axios.post("/api/charts", { currentInstance });
        toast.success(
          `Successfully saved ${currentInstance?.name} to the database.`,
        );
      },

      setChartInstance: (newInstance: ChartInstance) => {
        const updatedInstances = (get() as StoreState).chartInstances.map(
          (instance) => {
            if (instance.name === newInstance.name) {
              return newInstance;
            }
            return instance;
          },
        );
        set({ chartInstances: updatedInstances });
      },

      generateQuestions: () => {
        const { chartInstances, currentTab } = get() as StoreState;
        const decodedTabName = decodeURIComponent(currentTab);
        const currentInstance = chartInstances.find(
          (instance) => instance.name === decodedTabName,
        );
        if (currentInstance) {
          const questions = generateQuestionsFromChart(currentInstance);
          set({ questions });
          toast.success("Questions generated successfully!");
        } else {
          toast.error("No current instance found.");
        }
      },

      commitLocalChanges: (message: string) => {
        const { currentTab, chartInstances } = get() as StoreState;
        const decodedTabName = decodeURIComponent(currentTab);
        const updatedInstances = chartInstances.map((instance) => {
          if (instance.name === decodedTabName) {
            const newVersion = {
              version: (instance.publishedVersions?.length || 0) + 1,
              date: new Date().toISOString(),
              message,
              nodes: instance.initialNodes,
              edges: instance.initialEdges,
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
        toast.success("Local commit saved successfully.");
      },

      commitGlobalChanges: (message: string) => {
        const { chartInstances, globalCommits } = get() as StoreState;
        const newCommit: GlobalCommit = {
          version: (globalCommits.length || 0) + 1,
          date: new Date().toISOString(),
          message,
          chartInstances: chartInstances.map((ci) => ({
            ...ci,
            initialNodes: [...ci.initialNodes],
            initialEdges: [...ci.initialEdges],
          })),
        };
        set({
          globalCommits: [...globalCommits, newCommit],
        });
        toast.success("Global commit saved successfully.");
      },

      revertToLocalCommit: (message: string) => {
        const { currentTab, chartInstances } = get() as StoreState;
        const decodedTabName = decodeURIComponent(currentTab);
        const currentInstance = chartInstances.find(
          (instance) => instance.name === decodedTabName,
        );

        if (currentInstance) {
          const commit = currentInstance.publishedVersions?.find(
            (version) => version.message === message,
          );

          if (commit) {
            const { nodes, edges } = commit;
            const updatedInstance = {
              ...currentInstance,
              initialNodes: nodes,
              initialEdges: edges,
            };
            set({
              chartInstances: chartInstances.map((ci) =>
                ci.name === currentInstance.name ? updatedInstance : ci,
              ),
            });
            toast.success("Reverted to selected local commit.");
          }
        }
      },

      revertToGlobalCommit: (message: string) => {
        const { globalCommits } = get() as StoreState;
        const commit = globalCommits.find(
          (commit) => commit.message === message,
        );

        if (commit) {
          set({ chartInstances: commit.chartInstances });
          toast.success("Reverted to selected global commit.");
        }
      },

      setChartInstances: (chartInstances: ChartInstance[]) => {
        set({ chartInstances });
      },
    }),
    {
      name: "flow-chart-store",
    },
  ) as any,
);

export default useStore;
