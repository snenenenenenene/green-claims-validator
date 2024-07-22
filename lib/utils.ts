import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ms from "ms";
import { ChartInstance } from "@/lib/store";

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
function getStartNode(nodes) {
  return nodes.find((node) => node.type === "startNode");
}

export function getNextNode(currentNodeId, edges, answer) {
  const edge = edges.find(
    (edge) => edge.source === currentNodeId && edge.sourceHandle === answer,
  );
  return edge ? edge.target : null;
}

function getNextNodes(currentNodeId, edges) {
  return edges
    .filter((edge) => edge.source === currentNodeId)
    .map((edge) => ({ target: edge.target, handle: edge.sourceHandle }));
}

export function generateQuestionsFromChart(chartInstance) {
  const { initialNodes: nodes, initialEdges: edges } = chartInstance;
  const startNode = nodes.find((node) => node.type === "startNode");

  if (!startNode) {
    throw new Error("Start node not found.");
  }

  const questions = [];
  const visited = new Set();

  function traverse(nodeId, parentQuestion = null) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const currentNode = nodes.find((node) => node.id === nodeId);
    if (!currentNode) return;

    let question = null;

    switch (currentNode.type) {
      case "startNode":
        break; // Skip start nodes visually
      case "singleChoice":
        question = {
          id: currentNode.id,
          type: "singleChoice",
          question: currentNode.data.label,
          options: currentNode.data.options.map((option) =>
            typeof option === "string" ? option : option.label,
          ),
          connectedNodes: [],
        };
        questions.push(question);
        break;
      case "multipleChoice":
        question = {
          id: currentNode.id,
          type: "multipleChoice",
          question: currentNode.data.label,
          options: currentNode.data.options.map((option) =>
            typeof option === "string" ? option : option.label,
          ),
          connectedNodes: [],
        };
        questions.push(question);
        break;
      case "yesNo":
        question = {
          id: currentNode.id,
          type: "yesNo",
          question: currentNode.data.label,
          options: ["yes", "no"],
          connectedNodes: [],
        };
        questions.push(question);
        break;
      case "endNode":
        if (parentQuestion) {
          parentQuestion.connectedNodes.push({
            id: currentNode.id,
            type: "endNode",
            question: currentNode.data.label,
          });
        }
        return; // Skip end nodes visually and terminate the traversal
      default:
        break;
    }

    const nextNodes = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => ({ target: edge.target, handle: edge.sourceHandle }));

    nextNodes.forEach(({ target }) => {
      if (question) {
        const nextNode = nodes.find((node) => node.id === target);
        question.connectedNodes.push({
          id: nextNode.id,
          type: nextNode.type,
          question: nextNode.data.label,
        });
      }
      traverse(target, question);
    });
  }

  const initialNextNodes = edges
    .filter((edge) => edge.source === startNode.id)
    .map((edge) => edge.target);
  initialNextNodes.forEach((target) => traverse(target));

  return questions;
}
