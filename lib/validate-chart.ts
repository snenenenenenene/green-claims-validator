// lib/validate-chart.ts
interface Node {
  id: string;
  type: string;
  data: any;
}

interface Edge {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface Flow {
  nodes: Node[];
  edges: Edge[];
}

export function validateChartStructure(chart: any): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Check if it's a complete chart instance with flows
    if (
      !chart.flows ||
      !Array.isArray(chart.flows) ||
      chart.flows.length === 0
    ) {
      return { isValid: false, error: "No flows found in chart instance" };
    }

    const firstFlow = chart.flows[0];

    // Validate first flow structure
    if (!firstFlow.nodes || !firstFlow.edges) {
      return { isValid: false, error: "First flow missing nodes or edges" };
    }

    // Find start and end nodes
    const startNodes = firstFlow.nodes.filter(
      (node) => node.type === "startNode",
    );
    const endNodes = firstFlow.nodes.filter((node) => node.type === "endNode");

    if (startNodes.length === 0) {
      return { isValid: false, error: "No start node found in first flow" };
    }

    if (endNodes.length === 0) {
      return { isValid: false, error: "No end node found in first flow" };
    }

    // Check if there's a path from start to end
    const startNode = startNodes[0];
    const visited = new Set<string>();
    const hasPathToEnd = checkPathToEnd(
      startNode.id,
      firstFlow.edges,
      endNodes.map((n) => n.id),
      visited,
    );

    if (!hasPathToEnd) {
      return { isValid: false, error: "No valid path from start to end node" };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid chart structure" };
  }
}

function checkPathToEnd(
  currentNodeId: string,
  edges: Edge[],
  endNodeIds: string[],
  visited: Set<string>,
): boolean {
  if (endNodeIds.includes(currentNodeId)) return true;
  if (visited.has(currentNodeId)) return false;

  visited.add(currentNodeId);
  const connectedEdges = edges.filter((edge) => edge.source === currentNodeId);

  for (const edge of connectedEdges) {
    if (checkPathToEnd(edge.target, edges, endNodeIds, visited)) {
      return true;
    }
  }

  return false;
}
