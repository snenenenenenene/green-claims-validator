export const chartInstances = [
  {
    name: "Default",
    initialNodes: [
      {
        id: "1",
        type: "resizeRotate",
        position: { x: 0, y: 0 },
        data: { label: "1" },
      },
      {
        id: "2",
        type: "resizeRotate",
        position: { x: 0, y: 100 },
        data: { label: "2" },
      },
    ],
    initialEdges: [{ id: "1->2", source: "1", target: "2", label: "SChoen" }],
  },
  {
    name: "MacDOnarudse",
    initialNodes: [
      { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
      {
        id: "2",
        type: "resizeRotate",
        position: { x: 0, y: 100 },
        data: { label: "Greenwashing?" },
      },
    ],
    initialEdges: [{ id: "1->2", source: "1", target: "2" }],
  },
];
