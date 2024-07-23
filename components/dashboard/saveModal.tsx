import React, { useState, useEffect } from "react";

const SaveModal = ({ id, onSave, initialColor, initialOnePage }) => {
  const [color, setColor] = useState(initialColor);
  const [onePage, setOnePage] = useState(initialOnePage);

  useEffect(() => {
    setColor(initialColor);
    setOnePage(initialOnePage);
  }, [initialColor, initialOnePage]);

  const handleSave = () => {
    onSave(color, onePage);
    (document.getElementById(id) as any).close();
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Settings</h3>
        <div className="py-4">
          <label className="block">Tab Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full border p-2"
          />
          <label className="mt-4 block">One Page Mode:</label>
          <input
            type="checkbox"
            checked={onePage}
            onChange={(e) => setOnePage(e.target.checked)}
            className="form-checkbox"
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={handleSave}>
            Save
          </button>
          <button
            className="btn"
            onClick={() => (document.getElementById(id) as any).close()}
          >
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default SaveModal;
