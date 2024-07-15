export const chartInstances = [
  {
    name: "Default",
    initialNodes: [
      {
        id: "1",
        type: "startNode",
        position: { x: 0, y: 0 },
        data: { label: "Start" },
      },
      {
        id: "2",
        type: "yesNo",
        position: { x: 0, y: 100 },
        data: {
          label: "Is this a Yes/No question?",
          answers: { yes: "3", no: "4" },
        },
      },
      {
        id: "3",
        type: "singleChoice",
        position: { x: 0, y: 200 },
        data: {
          label: "Pick one:",
          options: ["Option 1", "Option 2"],
          answers: { "Option 1": "5", "Option 2": "6" },
        },
      },
      {
        id: "4",
        type: "multipleChoice",
        position: { x: 0, y: 300 },
        data: {
          label: "Pick multiple:",
          options: ["Option 1", "Option 2", "Option 3"],
          answers: { "Option 1": "7", "Option 2": "8", "Option 3": "9" },
        },
      },
      {
        id: "5",
        type: "endNode",
        position: { x: 0, y: 400 },
        data: { label: "End of Quiz", endType: "end", redirectTab: "" },
      },
    ],
    initialEdges: [
      { id: "e1-2", source: "1", sourceHandle: "bottom", target: "2" },
      { id: "e2-3", source: "2", sourceHandle: "yes", target: "3" },
      { id: "e2-4", source: "2", sourceHandle: "no", target: "4" },
      { id: "e3-5", source: "3", sourceHandle: "option-0", target: "5" },
      // Add more edges as needed
    ],
  },
  {
    name: "MacDOnarudse",
    initialNodes: [
      {
        id: "1",
        type: "startNode",
        position: { x: 0, y: 0 },
        data: { label: "Start" },
      },
      {
        id: "2",
        type: "yesNo",
        position: { x: 0, y: 100 },
        data: {
          label: "Is this a Yes/No question?",
          answers: { yes: "3", no: "4" },
        },
      },
      {
        id: "3",
        type: "singleChoice",
        position: { x: 0, y: 200 },
        data: {
          label: "Pick one:",
          options: ["Option 1", "Option 2"],
          answers: { "Option 1": "5", "Option 2": "6" },
        },
      },
      {
        id: "4",
        type: "multipleChoice",
        position: { x: 0, y: 300 },
        data: {
          label: "Pick multiple:",
          options: ["Option 1", "Option 2", "Option 3"],
          answers: { "Option 1": "7", "Option 2": "8", "Option 3": "9" },
        },
      },
      {
        id: "5",
        type: "endNode",
        position: { x: 0, y: 400 },
        data: { label: "End of Quiz", endType: "end", redirectTab: "" },
      },
    ],
    initialEdges: [
      { id: "e1-2", source: "1", sourceHandle: "bottom", target: "2" },
      { id: "e2-3", source: "2", sourceHandle: "yes", target: "3" },
      { id: "e2-4", source: "2", sourceHandle: "no", target: "4" },
      { id: "e3-5", source: "3", sourceHandle: "option-0", target: "5" },
      // Add more edges as needed
    ],
  },
];
