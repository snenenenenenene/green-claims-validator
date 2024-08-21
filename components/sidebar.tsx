import React, { useRef, useState } from 'react';
import useStore from '@/lib/store';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const {
    publishTab,
    saveToDb,
    setChartInstance,
    commitLocalChanges,
    commitGlobalChanges,
  } = useStore((state) => ({
    publishTab: state.publishTab,
    saveToDb: state.saveToDb,
    setChartInstance: state.setChartInstance,
    commitLocalChanges: state.addLocalCommit,
    commitGlobalChanges: state.addGlobalCommit,
  }));

  const fileInputRef = useRef(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitType, setCommitType] = useState('local');

  const handleDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const exportToJSON = () => {
    const chartInstances = useStore.getState().chartInstances;
    const blob = new Blob([JSON.stringify(chartInstances, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'chart-instances.json');
    toast.success('Exported successfully.');
  };

  const importFromJSON = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          data.forEach(setChartInstance);
          toast.success('Imported successfully.');
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        toast.error('Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleCommitAndSave = () => {
    const commitAction = commitType === 'local' ? commitLocalChanges : commitGlobalChanges;
    commitAction(commitMessage);
    saveToDb();
    setShowCommitModal(false);
    setCommitMessage('');
  };

  const handleSaveWithoutCommit = () => {
    saveToDb();
    toast.success('Saved without commit.');
  };

  const NodeButton = ({ Icon, nodeType, tooltip }) => (
    <div className="tooltip" data-tip={tooltip}>
      <div
        className="cursor-pointer rounded border p-2 btn flex items-center justify-center"
        onDragStart={(event) => handleDragStart(event, nodeType)}
        draggable
      >
        <Icon size={24} />
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
  ];

  return (
    <aside className="flex flex-col h-full justify-between  p-4 pt-20">
      <section className='flex flex-col space-y-4'>
        {nodes.map(({ Icon, nodeType, tooltip }) => (
          <NodeButton key={nodeType} Icon={Icon} nodeType={nodeType} tooltip={tooltip} />
        ))}
      </section>

      <section className="flex flex-col mt-auto" id="buttons">
        <div className="flex justify-between">
          <div className="tooltip w-full" data-tip="Save without commit">
            <button className="btn" onClick={handleSaveWithoutCommit}>
              <Save />
            </button>
          </div>
          <div className="tooltip w-full" data-tip="Save with commit">
            <button className="btn" onClick={() => setShowCommitModal(true)}>
              <MessageSquare />
            </button>
          </div>
        </div>

        <div className="flex w-full justify-between pt-4">
          <div className="tooltip" data-tip="Export as JSON">
            <button className="btn btn-ghost" onClick={exportToJSON}>
              <Download />
            </button>
          </div>
          <div className="tooltip" data-tip="Import from JSON">
            <button
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
            </button>
          </div>
          <div className="tooltip" data-tip="Publish the current tab">
            <button className="btn btn-ghost" onClick={publishTab}>
              <BookmarkPlus />
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: 'none' }}
          onChange={importFromJSON}
        />
      </section>

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
              >
                Save
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
