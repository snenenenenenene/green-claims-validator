import React from "react";
import useStore from "@/lib/store";

interface SidebarProps {
  onSave: () => void;
  onDelete: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSave, onDelete }) => {
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
        <button
          className="ml-auto w-full rounded-full border border-green bg-green p-1.5 px-8 py-4 text-black transition-all hover:border-yellow-hover hover:bg-yellow-hover"
          onClick={onSave}
        >
          Save
        </button>
        <button
          className="ml-auto w-full rounded-full p-1.5 px-8 py-4 text-gray-400 transition-all hover:underline"
          onClick={publishTab}
        >
          Publish
        </button>

        {lastPublishDate && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Last published: {new Date(lastPublishDate).toLocaleString()}
          </div>
        )}
        <button
          className="ml-auto w-full rounded-full p-1.5 px-8 py-4 text-white transition-all hover:text-gray-400 hover:underline"
          onClick={onDelete}
        >
          Delete
        </button>
      </section>
    </aside>
  );
};

export default Sidebar;
