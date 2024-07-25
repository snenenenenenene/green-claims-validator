import React, { useRef, useState } from "react";
import useStore from "@/lib/store";
import { saveAs } from "file-saver";
import { Download, Upload, BookmarkPlus } from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  onSave: () => void;
  onDelete: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSave, onDelete }) => {
  const { publishTab, saveToDb, setChartInstance, commitLocalChanges, commitGlobalChanges, globalCommits } =
    useStore((state) => ({
      publishTab: state.publishTab,
      saveToDb: state.saveToDb,
      setChartInstance: state.setChartInstance,
      commitLocalChanges: state.commitLocalChanges,
      commitGlobalChanges: state.commitGlobalChanges,
      globalCommits: state.globalCommits,
    }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [commitType, setCommitType] = useState<"local" | "global">("local");

  const onDragStart = (event: React.DragEvent, nodeType: string): void => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const exportToJSON = () => {
    const chartInstances = useStore.getState().chartInstances;
    const blob = new Blob([JSON.stringify(chartInstances, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "chart-instances.json");
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
          if (Array.isArray(data)) {
            data.forEach((instance) => setChartInstance(instance));
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

  const handleCommitAndSave = () => {
    if (commitType === "local") {
      commitLocalChanges(commitMessage);
    } else {
      commitGlobalChanges(commitMessage);
    }
    saveToDb();
    setShowCommitModal(false);
    setCommitMessage("");
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
          className="ml-auto w-full rounded-full border border-green bg-green p-1.5"
          onClick={() => setShowCommitModal(true)}
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
        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: "none" }}
          onChange={importFromJSON}
        />

        {showCommitModal && (
          <dialog open className="modal">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Commit and Save</h3>
              <div className="mt-4">
                <label className="block">Commit Message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter commit message"
                />
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  className={`btn ${commitType === "local" ? "btn-active" : ""}`}
                  onClick={() => setCommitType("local")}
                >
                  Local
                </button>
                <button
                  className={`btn ${commitType === "global" ? "btn-active" : ""}`}
                  onClick={() => setCommitType("global")}
                >
                  Global
                </button>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="btn" onClick={() => setShowCommitModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleCommitAndSave}>
                  Save
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>Close</button>
            </form>
          </dialog>
        )}
      </section>
    </aside>
  );
};

export default Sidebar;
