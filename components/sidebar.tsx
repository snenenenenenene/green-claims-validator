import React from "react";
import useStore from "@/lib/store";

interface SidebarProps {
  onSave: () => void;
  onDelete: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSave, onDelete }) => {
  const { onePage, setOnePage } = useStore((state) => ({
    onePage: state.onePage,
    setOnePage: state.setOnePage,
  }));

  const onDragStart = (event: React.DragEvent, nodeType: string): void => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleOnePageModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnePage(e.target.checked);
  };

  return (
    <aside className="mt-20 flex flex-col space-y-4 border-r-2 border-gray-200 p-4">
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
      <div className="flex items-center p-4">
        <label className="mr-2">One Page Mode:</label>
        <input
          type="checkbox"
          checked={onePage}
          onChange={handleOnePageModeChange}
          className="form-checkbox"
        />
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
          onClick={onDelete}
        >
          Delete
        </button>
      </section>
    </aside>
  );
};

export default Sidebar;
