// stores/questionnaireSlice.ts
import { StateCreator } from "zustand";
import { QuestionnaireState } from "./types";

const createQuestionnaireSlice: StateCreator<QuestionnaireState> = (
  set,
  get,
) => ({
  currentQuestionIndex: 0,
  questions: [],
  visualQuestions: [],
  onePage: false,
  currentWeight: 1,
  variables: {},
  chartContent: null,

  initializeQuestionnaire: async () => {
    try {
      const response = await fetch("/api/gcv/active-chart");
      if (!response.ok) throw new Error("Failed to fetch active chart");

      const data = await response.json();
      if (!data) {
        console.error("No active chart found");
        return false;
      }

      const chartContent = JSON.parse(data.content);
      set({ chartContent });
      get().generateQuestionsFromChart();
      return true;
    } catch (error) {
      console.error("Error initializing questionnaire:", error);
      return false;
    }
  },

  setOnePage: (value: boolean) => set({ onePage: value }),

  generateQuestionsFromChart: () => {
    const chartContent = get().chartContent;
    if (!chartContent) return [];

    // Get the flows from the chart content
    const flows =
      chartContent.type === "single" ? [chartContent.flow] : chartContent.flows;

    const processedQuestions = flows.flatMap((chart) => {
      console.log(`Processing chart: ${chart.name}`);

      return chart.nodes.map((node) => {
        // Find this node's outgoing edges
        const nodeEdges = chart.edges.filter((edge) => edge.source === node.id);
        console.log(`Processing node ${node.id}, found edges:`, nodeEdges);

        let options = [];

        if (node.type === "functionNode") {
          options = nodeEdges.map((edge) => ({
            label: edge.sourceHandle || "DEFAULT",
            nextNodeId: edge.target,
          }));
        } else if (node.type === "startNode") {
          const nextEdge = nodeEdges[0];
          options = [
            {
              label: "DEFAULT",
              nextNodeId: nextEdge ? nextEdge.target : null,
            },
          ];
        } else if (node.type === "yesNo") {
          const yesEdge = nodeEdges.find((edge) => edge.sourceHandle === "yes");
          const noEdge = nodeEdges.find((edge) => edge.sourceHandle === "no");
          options = [
            { label: "yes", nextNodeId: yesEdge ? yesEdge.target : null },
            { label: "no", nextNodeId: noEdge ? noEdge.target : null },
          ];
        } else if (node.type === "singleChoice") {
          options = node.data.options.map((option) => {
            const matchingEdge = nodeEdges.find((edge) =>
              edge.sourceHandle?.includes(option.id),
            );
            return {
              ...option,
              nextNodeId: matchingEdge ? matchingEdge.target : null,
            };
          });
        } else if (node.type === "weightNode") {
          const nextEdge = nodeEdges[0];
          options = [
            {
              label: "DEFAULT",
              nextNodeId: nextEdge ? nextEdge.target : null,
            },
          ];
        } else if (
          node.type === "endNode" &&
          node.data?.endType === "redirect"
        ) {
          const redirectChart = flows.find(
            (c) => c.name === node.data.redirectTab,
          );
          if (redirectChart) {
            const startNode = redirectChart.nodes.find(
              (n) => n.type === "startNode",
            );
            options = [
              {
                label: "DEFAULT",
                nextNodeId: startNode ? startNode.id : null,
              },
            ];
          }
        } else {
          const nextEdge = nodeEdges[0];
          options = [
            {
              label: "DEFAULT",
              nextNodeId: nextEdge ? nextEdge.target : null,
            },
          ];
        }

        return {
          ...node,
          id: node.id,
          type: node.type,
          question: node.data?.label || "",
          options: options,
          endType: node.data?.endType,
          redirectTab: node.data?.redirectTab,
          skipRender: [
            "weightNode",
            "startNode",
            "endNode",
            "functionNode",
          ].includes(node.type),
          weight: node.data?.weight || 1,
          chartId: chart.id,
        };
      });
    });

    const visualQuestions = processedQuestions.filter((q) => !q.skipRender);
    set({
      questions: processedQuestions,
      visualQuestions,
      currentQuestionIndex: 0,
    });

    return processedQuestions;
  },

  setCurrentWeight: (weight: number) => set({ currentWeight: weight }),

  resetCurrentWeight: () => set({ currentWeight: 1 }),

  getCurrentWeight: () => get().currentWeight,

  updateCurrentWeight: (weightMultiplier: number) =>
    set((state) => ({ currentWeight: state.currentWeight * weightMultiplier })),

  incrementCurrentQuestionIndex: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  resetCurrentQuestionIndex: () => set({ currentQuestionIndex: 0 }),

  getQuestionById: (id: string) => {
    const { questions } = get();
    return questions.find((q) => q.id === id) || null;
  },

  processFunctionNode: (node) => {
    console.log("Processing function node:", node);
    const { variables } = get();
    const sequences = node.data?.sequences || [];
    const selectedVariable = node.data?.selectedVariable;

    console.log("Current variables:", variables);
    console.log("Found sequences:", sequences);
    console.log("Selected variable:", selectedVariable);

    let result = variables[selectedVariable] || 0;
    console.log("Initial result value:", result);

    for (const seq of sequences) {
      console.log("Processing sequence:", seq);

      if (seq.type === "if") {
        console.log(
          `Evaluating condition: ${result} ${seq.condition} ${seq.value}`,
        );
        const condition = eval(`${result} ${seq.condition} ${seq.value}`);
        console.log("Condition result:", condition);

        if (condition) {
          console.log("Condition true, returning handleId:", seq.handleId);
          return seq.handleId;
        } else if (seq.children && seq.children.length > 0) {
          console.log("Condition false, checking else blocks");
          const elseBlock = seq.children.find((child) => child.type === "else");
          if (elseBlock) {
            console.log(
              "Found else block, returning handleId:",
              elseBlock.handleId,
            );
            return elseBlock.handleId;
          }
        }
      } else {
        console.log(`Performing ${seq.type} operation with value:`, seq.value);
        const oldResult = result;
        switch (seq.type) {
          case "addition":
            result += seq.value;
            break;
          case "subtraction":
            result -= seq.value;
            break;
          case "multiplication":
            result *= seq.value;
            break;
          case "division":
            result /= seq.value;
            break;
        }
        console.log(`${seq.type}: ${oldResult} -> ${result}`);
      }
    }

    console.log("Updating variables with final result:", result);
    set((state) => ({
      variables: {
        ...state.variables,
        [selectedVariable]: result,
      },
    }));

    console.log("No conditions met, returning default");
    return "default";
  },

  getNextQuestion: (currentQuestionId: string, answer: string) => {
    const { questions } = get();
    const currentQuestion = questions.find((q) => q.id === currentQuestionId);
    if (!currentQuestion) return null;

    let nextQuestionId;

    if (currentQuestion.type === "functionNode") {
      const handleId = get().processFunctionNode(currentQuestion);
      const selectedOption =
        currentQuestion.options.find((opt) => opt.label === handleId) ||
        currentQuestion.options.find((opt) => opt.label === "DEFAULT");
      nextQuestionId = selectedOption?.nextNodeId;
    } else if (["yesNo", "singleChoice"].includes(currentQuestion.type)) {
      const selectedOption = currentQuestion.options.find(
        (opt) => opt.label.toString().toLowerCase() === answer.toLowerCase(),
      );
      nextQuestionId = selectedOption?.nextNodeId;
    } else {
      const defaultOption = currentQuestion.options.find(
        (opt) => opt.label === "DEFAULT",
      );
      nextQuestionId = defaultOption?.nextNodeId;
    }

    return questions.find((q) => q.id === nextQuestionId) || null;
  },

  getFirstQuestion: () => {
    const { questions } = get();
    const startNode = questions.find((q) => q.type === "startNode");
    if (!startNode?.options?.[0]?.nextNodeId) return null;

    let nextQuestion = questions.find(
      (q) => q.id === startNode.options[0].nextNodeId,
    );

    // Skip weight nodes
    while (nextQuestion && nextQuestion.type === "weightNode") {
      const defaultOption = nextQuestion.options.find(
        (opt) => opt.label === "DEFAULT",
      );
      if (!defaultOption?.nextNodeId) break;
      nextQuestion = questions.find((q) => q.id === defaultOption.nextNodeId);
    }

    return nextQuestion;
  },
});

export default createQuestionnaireSlice;
