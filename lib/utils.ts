import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { Node, Edge } from "@/lib/types"; 

// Generates questions from a single chart instance
export function generateQuestionsFromChart(chartInstance: any) {
    const { initialNodes: nodes, initialEdges: edges } = chartInstance;
    const startNode = nodes.find((node: any) => node.type === "startNode");

    if (!startNode) {
        throw new Error(`Start node not found in chart: ${chartInstance.name}`);
    }

    const questions: any[] = [];
    const visited = new Set<string>();

    function traverse(nodeId: string) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const currentNode = nodes.find((node: any) => node.id === nodeId);
        if (!currentNode) return;

        const previousQuestionIds = edges
            .filter((edge: any) => edge.target === nodeId)
            .map((edge: any) => edge.source);

        const nextEdge = edges.find((edge: any) => edge.source === nodeId);
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
                    options: options.map((option: any) => ({
                        label: option.label || "Undefined Label",
                        nextQuestionId: option.nextNodeId || null,
                    })),
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

                if (currentNode.data.endType === "redirect" && currentNode.data.redirectTab) {
                    traverse(currentNode.data.nextNodeId);
                }
                return;
            }

            default:
                break;
        }

        const nextNodes = edges
            .filter((edge: any) => edge.source === nodeId)
            .map((edge: any) => edge.target);

        nextNodes.forEach((nextNodeId) => traverse(nextNodeId));
    }

    traverse(startNode.id);
    return questions;
}

// Generates questions from all chart instances
export function generateQuestionsFromAllCharts(chartInstances: any[]) {
    const allQuestions = chartInstances.flatMap((chartInstance) =>
        generateQuestionsFromChart(chartInstance)
    );

    console.log("All generated questions across all charts:", allQuestions);
    return allQuestions;
}
