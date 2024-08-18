import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  answer: string
): string | null {
  const edge = edges.find(
    (edge) => edge.source === currentNodeId && edge.sourceHandle === answer
  );
  return edge ? edge.target : null;
}

export function getFirstValidQuestionId(chartInstance: any) {
  // Skips weight nodes and returns the first valid question node's ID
  return chartInstance.initialNodes.find((node: any) => node.type !== 'weightNode')?.id || null;
}

export function generateQuestionsFromChart(chartInstance: any) {
  const { initialNodes: nodes, initialEdges: edges } = chartInstance;
  const startNode = nodes.find((node: any) => node.type === "startNode");

  if (!startNode) {
    throw new Error("Start node not found.");
  }

  const questions: any[] = [];
  const visited = new Set<string>();

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const currentNode = nodes.find((node: any) => node.id === nodeId);
    if (!currentNode) return;

    // Get all edges where this node is the source
    let nextNodes = edges
      .filter((edge: any) => edge.source === nodeId)
      .map((edge: any) => ({
        target: edge.target,
        sourceHandle: edge.sourceHandle,
      }));

    // Get all edges where this node is the target
    let previousNodes = edges
      .filter((edge: any) => edge.target === nodeId)
      .map((edge: any) => edge.source);

    switch (currentNode.type) {
      case "singleChoice":
      case "multipleChoice":
      case "yesNo":
        const options = currentNode.data.options || [];
        const question = {
          id: currentNode.id,
          type: currentNode.type,
          question: currentNode.data.label,
          options: options.map((option: any) => {
            const nextNode = nextNodes.find(n => n.sourceHandle === option.label);
            return {
              label: option.label || "Undefined Label",
              nextQuestionId: nextNode ? nextNode.target : null,
            };
          }),
          previousQuestionIds: previousNodes, // Add the previous question IDs
        };
        questions.push(question);
        console.log("Generated question:", question);
        break;

      case "endNode":
        const endQuestion = {
          id: currentNode.id,
          type: "endNode",
          question: currentNode.data.label,
          endType: currentNode.data.endType,
          redirectTab: currentNode.data.redirectTab,
          previousQuestionIds: previousNodes, // Add the previous question IDs
        };
        questions.push(endQuestion);
        console.log("Generated end node:", endQuestion);
        return; // End traversal here

      default:
        break;
    }

    nextNodes.forEach(({ target }) => traverse(target));
  }

  traverse(startNode.id);

  console.log("All generated questions:", questions);
  return questions;
}


export function getNextNodes(
  currentNodeId: string,
  edges: any[]
): { target: string; handle?: string | null }[] {
  return edges
    .filter((edge) => edge.source === currentNodeId)
    .map((edge) => ({ target: edge.target, handle: edge.sourceHandle }));
}
