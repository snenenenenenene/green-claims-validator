// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chartInstances as initialChartInstances } from "@/app/data/charts";
import toast from "react-hot-toast";
import { generateQuestionsFromChart } from "@/lib/utils";
import {  Node, Edge } from "@/lib/utils";

const useStore = create<any>(
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

      setCurrentTab: (tabName: string) => {
        set({ currentTab: tabName });
      },

      addNewTab: (newTabName: string) => {
        const newTab: any = {
          name: newTabName,
          initialNodes: [],
          initialEdges: [],
          onePageMode: false,
          color: "#ffffff",
          publishedVersions: [],
        };
        const updatedTabs = [...get().chartInstances, newTab];
        set({ chartInstances: updatedTabs, currentTab: newTabName });
      },

      setNodesAndEdges: (
        instanceName: string,
        nodes: Node[],
        edges: Edge[],
      ) => {
        const updatedInstances = get().chartInstances.map((instance: any) => {
          if (instance.name === instanceName) {
            return { ...instance, initialNodes: nodes, initialEdges: edges };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      setOnePage: (instanceName: string, value: boolean) => {
        const updatedInstances = get().chartInstances.map((instance: any) => {
          if (instance.name === instanceName) {
            return { ...instance, onePageMode: value };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      removeNode: (instanceName: string, nodeId: string) => {
        const updatedInstances = get().chartInstances.map((instance: any) => {
          if (instance.name === instanceName) {
            return {
              ...instance,
              initialNodes: instance.initialNodes.filter(
                (node: any) => node.id !== nodeId,
              ),
              initialEdges: instance.initialEdges.filter(
                (edge: any) => edge.source !== nodeId && edge.target !== nodeId,
              ),
            };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      deleteTab: (tabName: string) => {
        const updatedInstances = get().chartInstances.filter(
          (instance: any) => instance.name !== tabName,
        );
        const newCurrentTab =
          updatedInstances.length > 0 ? updatedInstances[0].name : "";
        set({ chartInstances: updatedInstances, currentTab: newCurrentTab });
      },

      publishTab: () => {
        const { currentTab, chartInstances } = get();
        const currentInstance = chartInstances.find(
          (instance: any) => instance.name === currentTab,
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
          (node: any) => node.type === "startNode",
        );
        const hasEndNode = currentInstance.initialNodes.some(
          (node: any) => node.type === "endNode",
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

        const updatedInstances = chartInstances.map((instance: any) => {
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

      setCurrentTabColor: (instanceName: string, color: string) => {
        const updatedInstances = get().chartInstances.map((instance: any) => {
          if (instance.name === instanceName) {
            return { ...instance, color: color };
          }
          return instance;
        });
        set({ chartInstances: updatedInstances });
      },

      setChartInstance: (newInstance: any) => {
        const updatedInstances = get().chartInstances.map((instance: any) => {
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
  ),
);

export default useStore;
