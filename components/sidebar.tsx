import React, { useRef } from "react";
import useStore from "@/lib/store";
import { saveAs } from "file-saver";
import { Download, Upload, BookmarkPlus } from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  onSave: () => void;
  onDelete: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSave }) => {
  const { publishTab, chartInstances, currentTab, saveToDb, setChartInstance } =
    useStore((state) => ({
      publishTab: state.publishTab,
      saveToDb: state.saveToDb,
      chartInstances: state.chartInstances,
      currentTab: state.currentTab,
      setChartInstance: state.setChartInstance,
    }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      toast.error("No instance selected.");
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
    toast.success("Exported successfully.");
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (text) {
        try {
          const data = JSON.parse(text as string);
          if (
            data.name &&
            Array.isArray(data.nodes) &&
            Array.isArray(data.edges)
          ) {
            const newInstance: any = {
              name: data.name,
              initialNodes: data.nodes,
              initialEdges: data.edges,
              onePageMode: false,
              color: "#ffffff",
              publishedVersions: [],
            };
            setChartInstance(newInstance);
            toast.success("Imported successfully.");
          } else {
            toast.error("Invalid file format.");
          }
        } catch (error) {
          toast.error("Invalid file format.");
        }
      }
    };
    reader.readAsText(file);
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
        <button
          className="ml-auto w-full rounded-full border border-green bg-green p-1.5 px-8 py-4 text-black transition-all hover:border-yellow-hover hover:bg-yellow-hover"
          onClick={saveToDb}
        >
          Save
        </button>

        <span className="flex w-full justify-between pt-2">
          <button className="btn btn-ghost" onClick={exportToJSON}>
            <Download />
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
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
      <input
        type="file"
        ref={fileInputRef}
        accept="application/json"
        style={{ display: "none" }}
        onChange={importFromJSON}
      />
    </aside>
  );
};

export default Sidebar;
