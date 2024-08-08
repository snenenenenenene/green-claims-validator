// utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ms from "ms";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return "never";
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? "" : " ago"
  }`;
};

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  return res.json();
}

export function nFormatter(num: number, digits?: number) {
  if (!num) return "0";
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
    : "0";
}

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    options?: { label: string; nextNodeId?: string }[];
    style?: { backgroundColor?: string };
    hidden?: boolean;
    endType?: string;
    redirectTab?: string;
    weight?: number;
  };
}

export interface Edge {
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
}

function getStartNode(nodes: Node[]): Node | undefined {
  return nodes.find((node) => node.type === "startNode");
}

export function getNextNode(
  currentNodeId: string,
  edges: Edge[],
  answer: string,
): string | null {
  const edge = edges.find(
    (edge) => edge.source === currentNodeId && edge.sourceHandle === answer,
  );
  return edge ? edge.target : null;
}

export function getNextNodes(
  currentNodeId: string,
  edges: Edge[],
): { target: string; handle?: string | null }[] {
  return edges
    .filter((edge) => edge.source === currentNodeId)
    .map((edge) => ({ target: edge.target, handle: edge.sourceHandle }));
}

export function generateQuestionsFromChart(chartInstance: any) {
  const { initialNodes: nodes, initialEdges: edges } = chartInstance;
  const startNode = getStartNode(nodes as any);

  if (!startNode) {
    throw new Error("Start node not found.");
  }

  const questions: any[] = [];
  const visited = new Set<string>();

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const currentNode = nodes.find((node) => node.id === nodeId);
    if (!currentNode) return;

    switch (currentNode.type) {
      case "startNode":
        break; // Skip start nodes visually
      case "singleChoice":
        questions.push({
          id: currentNode.id,
          type: "singleChoice",
          question: currentNode.data.label,
          options: currentNode.data.options?.map((option: any) => option) || [],
          connectedNodes: getNextNodes(currentNode.id, edges),
        });
        break;
      case "multipleChoice":
        questions.push({
          id: currentNode.id,
          type: "multipleChoice",
          question: currentNode.data.label,
          options: currentNode.data.options?.map((option: any) => option) || [],
          connectedNodes: getNextNodes(currentNode.id, edges),
        });
        break;
      case "yesNo":
        questions.push({
          id: currentNode.id,
          type: "yesNo",
          question: currentNode.data.label,
          options:
            currentNode.data.options?.map((option: any) => option.label) || [],
          connectedNodes: getNextNodes(currentNode.id, edges),
        });
        break;
      case "endNode":
        questions.push({
          id: currentNode.id,
          type: "endNode",
          question: currentNode.data.label,
          endType: currentNode.data.endType,
          redirectTab: currentNode.data.redirectTab,
          connectedNodes: getNextNodes(currentNode.id, edges),
        });
        return;
      case "weightNode":
        questions.push({
          id: currentNode.id,
          type: "weightNode",
          weight: currentNode.data.weight,
          connectedNodes: getNextNodes(currentNode.id, edges),
          skipRender: true, // Add flag to skip rendering
        });
        break;
      default:
        break;
    }

    const nextNodes = getNextNodes(nodeId, edges);
    nextNodes.forEach(({ target }) => traverse(target));
  }

  const initialNextNodes = getNextNodes(startNode.id, edges);
  initialNextNodes.forEach(({ target }) => traverse(target));

  console.log("Generated questions in utility function:", questions);
  return questions;
}
