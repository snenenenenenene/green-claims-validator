import React, { useRef, useState, useEffect } from 'react';
import { useStores } from '@/hooks/useStores';
import { saveAs } from 'file-saver';
import {
  Download,
  Upload,
  BookmarkPlus,
  Play,
  XOctagon,
  Scale,
  CircleDot,
  List,
  HelpCircle,
  MessageSquare,
  Save,
  FunctionSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { chartStore, commitStore, utilityStore } = useStores();

  const {
    chartInstances,
    setChartInstance,
    currentDashboardTab,
    publishTab,
  } = chartStore;

  const {
    addLocalCommit,
    addGlobalCommit,
  } = commitStore;

  const {
    saveToDb,
    loadSavedData,
  } = utilityStore;

  const fileInputRef = useRef(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitType, setCommitType] = useState('local');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const handleDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const exportToJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(chartInstances, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, 'chart-instances.json');
      toast.success('Chart exported successfully');
    } catch (error) {
      toast.error('Failed to export chart');
    }
  };

  const importFromJSON = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      try {
        const data = JSON.parse(text as string);
        if (Array.isArray(data)) {
          data.forEach(setChartInstance);
          toast.success('Chart imported successfully');
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleCommitAndSave = async () => {
    setIsSaving(true);
    const commitAction = commitType === 'local' ? addLocalCommit : addGlobalCommit;
    commitAction(commitMessage);
    await handleSaveToDb();
    setShowCommitModal(false);
    setCommitMessage('');
  };

  const handleSaveWithoutCommit = async () => {
    setIsSaving(true);
    await handleSaveToDb();
  };

  const handleSaveToDb = async () => {
    const toastId = toast.loading('Saving chart...');
    setIsSaving(true);
    try {
      await saveToDb(Object.values(chartInstances));
      await new Promise(resolve => setTimeout(resolve, 2000)); // Minimum 2 second delay
      setLastSavedAt(new Date());
      console.log("saved to db!")
      toast.success('Chart saved successfully', { id: toastId });
    } catch (error) {
      console.error(error)
      toast.error('Failed to save chart', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishTab = () => {
    try {
      publishTab();
      toast.success('Tab published successfully');
    } catch (error) {
      toast.error('Failed to publish tab');
    }
  };

  const NodeButton = ({ Icon, nodeType, tooltip }) => (
    <div className="relative group">
      <div
        className="cursor-pointer rounded border p-2 btn btn-sm btn-ghost flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
        onDragStart={(event) => handleDragStart(event, nodeType)}
        draggable
      >
        <Icon size={20} />
      </div>
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[9999] whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );

  const ActionButton = ({ Icon, onClick, tooltip, disabled = false }) => (
    <div className="relative group">
      <button
        className="btn btn-sm btn-ghost w-full"
        onClick={onClick}
        disabled={disabled}
      >
        {Icon}
      </button>
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[9999] whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );

  const nodes = [
    { Icon: Play, nodeType: 'startNode', tooltip: 'Start Node' },
    { Icon: XOctagon, nodeType: 'endNode', tooltip: 'End Node' },
    { Icon: Scale, nodeType: 'weightNode', tooltip: 'Weight Node' },
    { Icon: CircleDot, nodeType: 'singleChoice', tooltip: 'Single Choice Question' },
    { Icon: List, nodeType: 'multipleChoice', tooltip: 'Multiple Choice Question' },
    { Icon: HelpCircle, nodeType: 'yesNo', tooltip: 'Yes/No Question' },
    { Icon: FunctionSquare, nodeType: 'functionNode', tooltip: 'Function Node' },
  ];

  const currentInstance = chartInstances[currentDashboardTab];
  const hasUnsavedChanges = currentInstance?.hasUnsavedChanges || false;

  return (
    <aside className="flex flex-col h-full w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-[100]">
      <section className="flex flex-col space-y-2 p-2">
        {nodes.map(({ Icon, nodeType, tooltip }) => (
          <NodeButton key={nodeType} Icon={Icon} nodeType={nodeType} tooltip={tooltip} />
        ))}
      </section>

      <section className="flex flex-col mt-auto p-2 space-y-2" id="buttons">
        <ActionButton
          Icon={isSaving ? <span className="loading loading-spinner loading-sm"></span> : <Save size={20} />}
          onClick={handleSaveWithoutCommit}
          tooltip="Save without commit"
          disabled={isSaving}
        />
        <ActionButton
          Icon={<MessageSquare size={20} />}
          onClick={() => setShowCommitModal(true)}
          tooltip="Save with commit"
          disabled={isSaving}
        />
        <ActionButton
          Icon={<Download size={20} />}
          onClick={exportToJSON}
          tooltip="Export as JSON"
        />
        <ActionButton
          Icon={<Upload size={20} />}
          onClick={() => (fileInputRef.current as any).click()}
          tooltip="Import from JSON"
        />
        <ActionButton
          Icon={<BookmarkPlus size={20} />}
          onClick={handlePublishTab}
          tooltip="Publish the current tab"
        />

        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: 'none' }}
          onChange={importFromJSON}
        />

        {lastSavedAt && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Last saved:<br />{lastSavedAt.toLocaleString()}
          </div>
        )}
        {hasUnsavedChanges && (
          <div className="text-xs text-warning text-center">Unsaved Changes</div>
        )}
      </section>

      {showCommitModal && (
        <dialog open className="modal z-[9999]">
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
                className={`btn ${commitType === 'local' ? 'btn-active' : ''}`}
                onClick={() => setCommitType('local')}
              >
                Local
              </button>
              <button
                className={`btn ${commitType === 'global' ? 'btn-active' : ''}`}
                onClick={() => setCommitType('global')}
              >
                Global
              </button>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="btn"
                onClick={() => setShowCommitModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleCommitAndSave}
                disabled={isSaving}
              >
                {isSaving ? <span className="loading loading-spinner loading-sm"></span> : 'Save'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Close</button>
          </form>
        </dialog>
      )}
    </aside>
  );
};

export default Sidebar;