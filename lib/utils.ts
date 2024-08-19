import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { Node, Edge } from "@/lib/types"; 

// Generates questions from a single chart instance
export function generateQuestionsFromChart(chartInstances) {
  if (!Array.isArray(chartInstances)) {
    chartInstances = [chartInstances];
  }

  const allQuestions = [];

  chartInstances.forEach((chartInstance, index) => {
    const { initialNodes: nodes, initialEdges: edges } = chartInstance;
    const startNode = nodes.find((node) => node.type === "startNode");

    if (!startNode) {
      throw new Error(`Start node not found in chart: ${chartInstance.name}`);
    }

    const questions = [];
    const visited = new Set();

    function traverse(nodeId, currentChartIndex) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const currentNode = chartInstances[currentChartIndex].initialNodes.find(
        (node) => node.id === nodeId
      );
      if (!currentNode) return;

      const previousQuestionIds = edges
        .filter((edge) => edge.target === nodeId)
        .map((edge) => edge.source);

      const nextEdge = edges.find((edge) => edge.source === nodeId);
      const nextNodeId = nextEdge ? nextEdge.target : null;

      switch (currentNode.type) {
        case "singleChoice":
        case "multipleChoice":
        case "yesNo": {
          const options = currentNode.data.options || [];
          const question = {
            id: currentNode.id,
            type: currentNode.type,
            question: currentNode.data.label,
            options: options.map((option) => {
              return {
                label: option.label || "Undefined Label",
                nextQuestionId: option.nextNodeId || null,
              };
            }),
            previousQuestionIds,
          };
          questions.push(question);
          break;
        }

        case "weightNode":
        case "startNode": {
          const baseQuestion = {
            id: currentNode.id,
            type: currentNode.type,
            question: currentNode.data.label,
            options: [
              {
                label: "DEFAULT",
                nextQuestionId: nextNodeId,
              },
            ],
            previousQuestionIds,
            skipRender: true,
            weight: currentNode.data.weight || 1, // Add weight property here
          };
          questions.push(baseQuestion);
          break;
        }

        case "endNode": {
          const endQuestion = {
            id: currentNode.id,
            type: "endNode",
            question: currentNode.data.label,
            endType: currentNode.data.endType,
            redirectTab: currentNode.data.redirectTab,
            nextNodeId: currentNode.data.nextNodeId || null,
            previousQuestionIds,
            skipRender: true,
          };
          questions.push(endQuestion);

          // Handle redirect to another chart
          if (currentNode.data.endType === "redirect" && currentNode.data.redirectTab) {
            const redirectChartIndex = chartInstances.findIndex(
              (instance) => instance.name === currentNode.data.redirectTab
            );
            if (redirectChartIndex >= 0) {
              traverse(currentNode.data.nextNodeId, redirectChartIndex);
            }
          }
          return; // End traversal here for end nodes
        }

        default:
          break;
      }

      const nextNodes = edges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);

      nextNodes.forEach((nextNodeId) => traverse(nextNodeId, currentChartIndex));
    }

    traverse(startNode.id, index);
    allQuestions.push(...questions);
  });

  console.log("All generated questions across all charts:", allQuestions);
  return allQuestions;
}

export function generateQuestionsFromAllCharts(chartInstances) {
  return chartInstances.flatMap((chartInstance) =>
    chartInstance.initialNodes.map((node) => {
      // Ensure options are filled correctly
      const options = node.data.options || [];
      
      // Check for nextNodeId for nodes that might not have explicit options
      if (!options.length && node.data.nextNodeId) {
        options.push({
          label: "DEFAULT",
          nextQuestionId: node.data.nextNodeId
        });
      }

      return {
        ...JSON.parse(JSON.stringify(node)), // Deep copy to avoid mutations
        options, // Assign the processed options
      };
    })
  );
}
