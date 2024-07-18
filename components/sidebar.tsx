import React from "react";
import useStore from "@/lib/store";
import { saveAs } from "file-saver";
import { Download, Import, BookmarkPlus } from "lucide-react";

interface SidebarProps {
  onSave: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSave }) => {
  const { publishTab, chartInstances, currentTab } = useStore((state) => ({
    publishTab: state.publishTab,
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
  }));

  const onDragStart = (event: React.DragEvent, nodeType: string): void => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const currentInstance = chartInstances.find(
    (instance) => instance.name === currentTab,
  );

  const lastPublishDate = currentInstance?.publishedVersions?.length
    ? currentInstance.publishedVersions[
        currentInstance.publishedVersions.length - 1
      ].date
    : null;

  const exportToJSON = () => {
    if (!currentInstance) {
      alert("No instance selected.");
      return;
    }

    const { name, initialNodes, initialEdges } = currentInstance;
    const dataToExport = {
      name,
      nodes: initialNodes,
      edges: initialEdges,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    saveAs(blob, `${name}.json`);
  };

  return (
    <aside className="flex flex-col space-y-4 p-4 pt-20">
      <div
        className="cursor-pointer rounded border bg-white p-2 hover:bg-gray-100"
        onDragStart={(event) => onDragStart(event, "startNode")}
        draggable
      >
        Start Node
      </div>
      <div
        className="cursor-pointer rounded border bg-white p-2 hover:bg-gray-100"
        onDragStart={(event) => onDragStart(event, "yesNo")}
        draggable
      >
        Yes/No Question
      </div>
      <div
        className="cursor-pointer rounded border bg-white p-2 hover:bg-gray-100"
        onDragStart={(event) => onDragStart(event, "singleChoice")}
        draggable
      >
        Single Choice Question
      </div>
      <div
        className="cursor-pointer rounded border bg-white p-2 hover:bg-gray-100"
        onDragStart={(event) => onDragStart(event, "multipleChoice")}
        draggable
      >
        Multiple Choice Question
      </div>
      <div
        className="cursor-pointer rounded border bg-white p-2 hover:bg-gray-100"
        onDragStart={(event) => onDragStart(event, "endNode")}
        draggable
      >
        End Node
      </div>
      <section className="flex h-full w-full flex-col pt-4" id="buttons">
        <button className="btn btn-success mt-auto" onClick={onSave}>
          Save
        </button>

        <span className="flex flex w-full justify-between pt-2">
          <button className="btn btn-ghost" onClick={exportToJSON}>
            <Download />
          </button>
          <button className="btn btn-ghost" onClick={exportToJSON}>
            <Import />
          </button>
          <button className="btn btn-ghost" onClick={publishTab}>
            <BookmarkPlus />
          </button>
        </span>
        {lastPublishDate && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Last published: {new Date(lastPublishDate).toLocaleString()}
          </div>
        )}
      </section>
    </aside>
  );
};

export default Sidebar;
