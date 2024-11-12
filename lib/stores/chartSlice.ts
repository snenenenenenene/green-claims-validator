import { addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";
import { ChartInstance, ChartState, EdgeChange, NodeChange } from "./types";

const createChartSlice: StateCreator<ChartState> = (set, get) => ({
  chartInstances: [],
  currentDashboardTab: "",

  setCurrentDashboardTab: (tabId: string) =>
    set((state) => {
      if (state.currentDashboardTab !== tabId) {
        console.log(`Updating currentDashboardTab to: ${tabId}`);
        return { currentDashboardTab: tabId };
      }
      return state;
    }),

  addNewTab: (newTabName: string) => {
    const newTab: ChartInstance = {
      id: uuidv4(),
      name: newTabName,
      nodes: [],
      edges: [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };
    set((state) => ({
      chartInstances: [...state.chartInstances, newTab],
      currentDashboardTab: newTab.id,
    }));
    return newTab.id;
  },

  updateNodes: (instanceId: string, changes: NodeChange[]) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, nodes: applyNodeChanges(changes, instance.nodes) }
          : instance,
      ),
    })),

  updateEdges: (instanceId: string, changes: EdgeChange[]) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, edges: applyEdgeChanges(changes, instance.edges) }
          : instance,
      ),
    })),

  addNode: (instanceId: string, newNode: Node) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, nodes: [...instance.nodes, newNode] }
          : instance,
      ),
    })),

  addEdge: (instanceId: string, newEdge: Edge) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, edges: addEdge(newEdge, instance.edges) }
          : instance,
      ),
    })),

  updateNode: (instanceId: string, nodeId: string, newData: Partial<Node>) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...newData } : node,
              ),
            }
          : instance,
      ),
    })),

  removeNode: (instanceId: string, nodeId: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.filter((node) => node.id !== nodeId),
              edges: instance.edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId,
              ),
            }
          : instance,
      ),
    })),

  deleteTab: (tabId: string) =>
    set((state) => {
      const updatedInstances = state.chartInstances.filter(
        (instance) => instance.id !== tabId,
      );
      const newCurrentTab =
        updatedInstances.length > 0 ? updatedInstances[0].id : "";
      return {
        chartInstances: updatedInstances,
        currentDashboardTab: newCurrentTab,
      };
    }),

  updateChartInstance: (updatedInstance: ChartInstance) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === updatedInstance.id ? updatedInstance : instance,
      ),
    })),

  setChartInstances: (newInstances: ChartInstance[]) =>
    set({ chartInstances: newInstances }),

  updateChartInstanceName: (tabId: string, newName: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, name: newName } : instance,
      ),
    })),

  setCurrentTabColor: (tabId: string, color: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, color } : instance,
      ),
    })),

  setOnePage: (tabId: string, value: boolean) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, onePageMode: value } : instance,
      ),
    })),

  addPublishedVersion: (tabId: string, version: number, date: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId
          ? {
              ...instance,
              publishedVersions: [
                ...(instance.publishedVersions || []),
                { version, date },
              ],
            }
          : instance,
      ),
    })),

  revertToVersion: (tabId: string, version: number) =>
    set((state) => {
      const instance = state.chartInstances.find(
        (instance) => instance.id === tabId,
      );
      if (instance && instance.publishedVersions) {
        const versionData = instance.publishedVersions.find(
          (v) => v.version === version,
        );
        if (versionData) {
          return {
            chartInstances: state.chartInstances.map((instance) =>
              instance.id === tabId
                ? {
                    ...instance,
                    nodes: versionData.nodes,
                    edges: versionData.edges,
                  }
                : instance,
            ),
          };
        }
      }
      return state;
    }),

  publishTab: (tabId: string) =>
    set((state) => {
      const instance = state.chartInstances.find(
        (instance) => instance.id === tabId,
      );
      if (instance) {
        const newVersion = (instance.publishedVersions?.length || 0) + 1;
        return {
          chartInstances: state.chartInstances.map((instance) =>
            instance.id === tabId
              ? {
                  ...instance,
                  publishedVersions: [
                    ...(instance.publishedVersions || []),
                    {
                      version: newVersion,
                      date: new Date().toISOString(),
                      nodes: instance.nodes,
                      edges: instance.edges,
                    },
                  ],
                }
              : instance,
          ),
        };
      }
      return state;
    }),

  getChartInstance: (tabId: string) => {
    const { chartInstances } = get();
    return chartInstances.find((instance) => instance.id === tabId);
  },

  getCurrentChartInstance: () => {
    const { chartInstances, currentDashboardTab } = get();
    return chartInstances.find(
      (instance) => instance.id === currentDashboardTab,
    );
  },

  // New method to update node data
  updateNodeData: (instanceId: string, nodeId: string, newData: any) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, ...newData } }
                  : node,
              ),
            }
          : instance,
      ),
    })),
});

export default createChartSlice;
