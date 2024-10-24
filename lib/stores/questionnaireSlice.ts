import { StateCreator } from 'zustand';
import { QuestionnaireState, ChartInstance, Node, Edge } from './types';

const createQuestionnaireSlice: StateCreator<QuestionnaireState> = (set, get) => ({
  currentQuestionIndex: 0,
  questions: [],
  visualQuestions: [],
  onePage: false,
  currentWeight: 1,
  variables: {},

  setOnePage: (value: boolean) => set({ onePage: value }),

  generateQuestionsFromAllCharts: () => {
    const chartInstances = get().chartInstances;
    if (!chartInstances?.length) return [];

    const processedQuestions = chartInstances.flatMap(chart => {
      console.log(`Processing chart: ${chart.name}`);
      
      return chart.nodes.map(node => {
        // Find this node's outgoing edges
        const nodeEdges = chart.edges.filter(edge => edge.source === node.id);
        console.log(`Processing node ${node.id}, found edges:`, nodeEdges);

        let options = [];

        if (node.type === "startNode") {
          // Start nodes should use their first outgoing edge
          const nextEdge = nodeEdges[0];
          console.log(`Start node ${node.id} using edge:`, nextEdge);
          options = [{
            label: "DEFAULT",
            nextNodeId: nextEdge ? nextEdge.target : null  // Directly use the target
          }];
        } else if (node.type === "yesNo") {
          const yesEdge = nodeEdges.find(edge => edge.sourceHandle === "yes");
          const noEdge = nodeEdges.find(edge => edge.sourceHandle === "no");
          options = [
            { label: "yes", nextNodeId: yesEdge ? yesEdge.target : null },
            { label: "no", nextNodeId: noEdge ? noEdge.target : null }
          ];
        } else if (node.type === "singleChoice") {
          options = node.data.options.map(option => {
            const matchingEdge = nodeEdges.find(edge => 
              edge.sourceHandle?.includes(option.id)
            );
            return {
              ...option,
              nextNodeId: matchingEdge ? matchingEdge.target : null
            };
          });
        } else if (node.type === "weightNode") {
          // Weight nodes should use their first outgoing edge
          const nextEdge = nodeEdges[0];
          options = [{
            label: "DEFAULT",
            nextNodeId: nextEdge ? nextEdge.target : null
          }];
        } else if (node.type === "endNode" && node.data?.endType === "redirect") {
          // For redirect nodes, find the start node of the target chart
          const redirectChart = chartInstances.find(c => c.name === node.data.redirectTab);
          if (redirectChart) {
            const startNode = redirectChart.nodes.find(n => n.type === "startNode");
            options = [{ 
              label: "DEFAULT", 
              nextNodeId: startNode ? startNode.id : null 
            }];
          }
        } else {
          // Default case: use first edge if available
          const nextEdge = nodeEdges[0];
          options = [{
            label: "DEFAULT",
            nextNodeId: nextEdge ? nextEdge.target : null
          }];
        }

        console.log(`Final options for node ${node.id}:`, options);

        return {
          ...node,
          id: node.id,
          type: node.type,
          question: node.data?.label || '',
          options: options,
          endType: node.data?.endType,
          redirectTab: node.data?.redirectTab,
          skipRender: ["weightNode", "startNode", "endNode", "functionNode"].includes(node.type),
          weight: node.data?.weight || 1,
          chartId: chart.id,
        };
      });
    });

    const visualQuestions = processedQuestions.filter(q => !q.skipRender);
    set({ 
      questions: processedQuestions, 
      visualQuestions, 
      currentQuestionIndex: 0 
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
    const { variables } = get();
    const { sequences, selectedVariable } = node;

    let result = variables[selectedVariable] || 0;

    for (const seq of sequences) {
      if (seq.type === 'if') {
        const condition = eval(`${result} ${seq.condition} ${seq.value}`);
        if (condition) {
          return seq.handleId;
        } else if (seq.children && seq.children.length > 0) {
          const elseBlock = seq.children.find((child) => child.type === 'else');
          if (elseBlock) {
            return elseBlock.handleId;
          }
        }
      } else {
        switch (seq.type) {
          case 'addition':
            result += seq.value;
            break;
          case 'subtraction':
            result -= seq.value;
            break;
          case 'multiplication':
            result *= seq.value;
            break;
          case 'division':
            result /= seq.value;
            break;
        }
      }
    }

    set((state) => ({
      variables: {
        ...state.variables,
        [selectedVariable]: result,
      },
    }));

    return 'default';
  },

  getNextQuestion: (currentQuestionId: string, answer: string) => {
    const { questions } = get();
    const currentQuestion = questions.find((q) => q.id === currentQuestionId);
    if (!currentQuestion) return null;

    let nextQuestionId;

    if (currentQuestion.type === 'functionNode') {
      const handleId = get().processFunctionNode(currentQuestion);
      const selectedOption = currentQuestion.options.find((opt) => opt.label === handleId) || 
                           currentQuestion.options.find((opt) => opt.label === "DEFAULT");
      nextQuestionId = selectedOption?.nextNodeId;
    } else if (["yesNo", "singleChoice"].includes(currentQuestion.type)) {
      const selectedOption = currentQuestion.options.find((opt) => 
        opt.label.toString().toLowerCase() === answer.toLowerCase()
      );
      nextQuestionId = selectedOption?.nextNodeId;
    } else {
      const defaultOption = currentQuestion.options.find((opt) => opt.label === "DEFAULT");
      nextQuestionId = defaultOption?.nextNodeId;
    }

    return questions.find((q) => q.id === nextQuestionId) || null;
  },

  getFirstQuestion: () => {
    const { questions } = get();
    const startNode = questions.find(q => q.type === "startNode");
    if (!startNode?.options?.[0]?.nextNodeId) return null;

    let nextQuestion = questions.find(q => q.id === startNode.options[0].nextNodeId);
    
    // Skip weight nodes
    while (nextQuestion && nextQuestion.type === "weightNode") {
      const defaultOption = nextQuestion.options.find(opt => opt.label === "DEFAULT");
      if (!defaultOption?.nextNodeId) break;
      nextQuestion = questions.find(q => q.id === defaultOption.nextNodeId);
    }

    return nextQuestion;
  },
});

export default createQuestionnaireSlice;